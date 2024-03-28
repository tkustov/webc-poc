import { create_template } from '../common/create_template';
import { define_webc } from '../common/define_webc';
import { qchone } from '../common/dom-query';

const TABPANEL_SLOT = '$tabpanel';
const TAB_ID_ATTR = 'data-cx-tab';
const TAB_PANEL_ATTR = 'data-cx-tab-panel';

const template = create_template(`
  <ul id="tablist" part="tablist" aria-role="tablist"></ul>

  <div id="tabpanel" part="tabpanel" aria-role="tabpanel">
    <slot name="${TABPANEL_SLOT}"></slot>
  </div>

  <style>
  :host {
    display: flex;
    gap: 0;
    flex-direction: column;
    flex-wrap: nowrap;
  }

  /* nav-position=right */
  :host([nav-position="right"]) {
    flex-direction: row;
  }
  :host([nav-position="right"]) #nav {
    order: 2;
    flex-direction: column;
  }
  :host([nav-position="right"]) #content {
    order: 1;
  }

  /* nav-position=bottom */
  :host([nav-position="bottom"]) {
    flex-direction: column;
  }
  :host([nav-position="bottom"]) #nav {
    order: 2;
    flex-direction: row;
  }
  :host([nav-position="bottom"]) #content {
    order: 1;
  }

  /* nav-position=left */
  :host([nav-position="left"]) {
    flex-direction: row;
  }
  :host([nav-position="left"]) #nav {
    order: 1;
    flex-direction: column;
  }
  :host([nav-position="left"]) #content {
    order: 2;
  }

  #tablist {
    flex: none;
    padding: 0;
    margin: 0;
    list-style: none;
    /* layout */
    display: flex;
    gap: 0;
    flex-wrap: nowrap;
    flex-direction: row;
    justify-content: flex-start;
  }

  .tab {
    flex: none;
    margin: 0;
    cursor: default;
  }

  #tablist {
    flex: auto;
    min-width: 0;
    min-height: 0;
  }
  </style>
`);

export class TabChangeEvent extends CustomEvent<{ tab: string; }> {
  constructor(tab: string) {
    super('tab-change', {
      detail: { tab },
      bubbles: true,
      cancelable: true
    });
  }
}

export class Tabs extends HTMLElement implements CustomElementLifecycle {
  #tabsObserver;
  #tabAttrObserver;

  static get observedAttributes(): string[] {
    return ['active'];
  }

  constructor() {
    super();
    this.#tabsObserver = new MutationObserver(this.#handleTablistChange);
    this.#tabAttrObserver = new MutationObserver(this.#handleTabAttrChange);
    const shadowRoot = this.attachShadow({ mode: 'open', delegatesFocus: true });
    shadowRoot.appendChild(template.content.cloneNode(true));
    this.#tabsObserver.observe(this, {
      childList: true,
      attributes: false
    });
    this.#tablist.addEventListener('click', this.#handleNavClick);
    this.#tablist.addEventListener('focusin', this.#handleNavFocus);
  }

  connectedCallback(): void {
    this.#init();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (name === 'active') {
      if (oldValue) {
        this.#unsetTabContent(oldValue);
        this.#getTab(oldValue)?.setAttribute('aria-selected', 'false');
      }
      if (newValue) {
        this.#setTabContent(newValue);
        this.#getTab(newValue)?.setAttribute('aria-selected', 'true');
      }
    }
  }

  get active(): string | undefined {
    return this.getAttribute('active') ?? undefined;
  }

  set active(tab: string | undefined) {
    if (tab) {
      this.setAttribute('active', tab);
    } else {
      this.removeAttribute('active');
    }
  }

  insertTab(
    tabId: string,
    tabItem: HTMLElement,
    tabContent: HTMLElement,
  ): void {
    tabItem.setAttribute(TAB_ID_ATTR, tabId);
    tabContent.setAttribute(TAB_PANEL_ATTR, tabId);
    this.appendChild(tabItem);
    this.appendChild(tabContent);
  }

  removeTab(tabId: string): void {
    const tabItem = qchone(this, `[${TAB_ID_ATTR}="${tabId}"]`);
    const tabContent = qchone(this, `[${TAB_PANEL_ATTR}="${tabId}"]`);
    if (this.active === tabId) {
      this.removeAttribute('active');
    }
    if (tabItem) {
      this.removeChild(tabItem);
    }
    if (tabContent) {
      this.removeChild(tabContent);
    }
  }

  get #tablist(): HTMLElement {
    return this.shadowRoot!.getElementById('tablist')!;
  }

  #init(): void {
    for (const node of this.childNodes) {
      if (!(node instanceof HTMLElement)) continue;
      if (node.dataset.cxTab) {
        this.#addTab(node.dataset.cxTab);
        node.setAttribute('slot', this.#getTabSlotName(node.dataset.cxTab));
      }
    }
  }

  #getTab(tabId: string): HTMLElement | undefined {
    const item = qchone(this.#tablist, `li[data-tab="${tabId}"]`);
    if (item instanceof HTMLElement) return item;
    return undefined;
  }

  #handleTablistChange = (records: MutationRecord[]) => {
    for (const { type, addedNodes, removedNodes } of records) {
      if (type !== 'childList') continue;
      for (const node of addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        this.#tabAttrObserver.observe(node, {
          attributes: true,
          attributeFilter: [TAB_ID_ATTR, TAB_PANEL_ATTR]
        });
        const tabId = node.getAttribute(TAB_ID_ATTR);
        if (tabId) {
          this.#addTab(tabId);
          node.setAttribute('slot', this.#getTabSlotName(tabId));
        }
      }
      for (const node of removedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        const tabId = node.getAttribute(TAB_ID_ATTR);
        if (tabId) {
          this.#delTab(tabId);
        }
      }
    }
  };

  #handleTabAttrChange = (records: MutationRecord[]) => {
    for (const { target, type, attributeName, oldValue } of records) {
      if (
        type !== 'attributes'
        || !attributeName
        || !(target instanceof HTMLElement)
      ) continue;
      const newValue = target.getAttribute(attributeName);
      if (attributeName === TAB_ID_ATTR) {
        if (!newValue && oldValue) {
          this.#delTab(oldValue);
          if (oldValue === this.active) {
            this.#unsetTabContent(oldValue);
          }
        }
        if (newValue && !oldValue) {
          this.#addTab(newValue);
          target.setAttribute('slot', this.#getTabSlotName(newValue));
        }
        if (newValue && oldValue && newValue !== oldValue) {
          this.#delTab(oldValue);
          this.#addTab(newValue);
          target.setAttribute('slot', this.#getTabSlotName(newValue));
        }
      }
    }
  };

  #handleNavClick = (event: MouseEvent) => {
    const nextTab = event.composedPath().find((el): el is HTMLElement => {
      return (
        el instanceof HTMLElement
        && el.parentElement === event.currentTarget
        && el.matches('li[data-tab]')
      );
    })?.dataset.tab;
    if (!nextTab) return;
    this.#changeTab(nextTab);
  };

  #handleNavFocus = () => {
    this.#tablist.addEventListener('keydown', this.#handleNavKbd, { passive: true });
    this.#tablist.addEventListener('focusout', () => {
      this.#tablist.removeEventListener('keydown', this.#handleNavKbd);
    }, { passive: true, once: true });
  };

  #handleNavKbd = (event: KeyboardEvent) => {
    const navItem = this.shadowRoot?.activeElement;
    if (!(navItem instanceof HTMLElement) || navItem.parentElement !== this.#tablist) return;
    if (event.code === 'Enter' || event.code === 'Space') {
      this.#changeTab(navItem.dataset.tab!);
    }
    if (event.code === 'ArrowLeft' || event.code === 'ArrowUp') {
      const prevItem = navItem.previousElementSibling;
      if (!(prevItem instanceof HTMLElement)) return;
      prevItem.focus();
    }
    if (event.code === 'ArrowRight' || event.code === 'ArrowDown') {
      const nextItem = navItem.nextElementSibling;
      if (!(nextItem instanceof HTMLElement)) return;
      nextItem.focus();
    }
  };

  #changeTab(tabId: string): void {
    const changeEvent = new TabChangeEvent(tabId);
    this.dispatchEvent(changeEvent);
    if (!changeEvent.defaultPrevented) {
      this.active = tabId;
    }
  }

  #addTab(tab: string): void {
    const existing = this.#getTab(tab);
    if (existing) return;
    const item = this.#getTabTemplate(tab);
    this.#tablist?.appendChild(item);
  }

  #delTab(tab: string): void {
    const tablist = this.#tablist;
    const item = tablist?.querySelector(`li[data-tab="${tab}"]`);
    if (!item) return;
    tablist?.removeChild(item);
  }

  #getTabTemplate(tab: string): Node {
    const tmpl = create_template(`
      <li
        tabindex="0"
        class="tab"
        part="tab"
        data-tab="${tab}"
        aria-role="tab"
        aria-controls="tabpanel"
        aria-selected="false"
      >
        <slot name="${this.#getTabSlotName(tab)}"></slot>
      </li>
    `);
    return tmpl.content.cloneNode(true);
  }

  #getTabSlotName(tab: string): string { return `$tab[${tab}]`; }

  #unsetTabContent(tab: string): void {
    const contentEl = this.querySelector(`[${TAB_PANEL_ATTR}="${tab}"]`);
    if (!contentEl) return;
    contentEl.removeAttribute('slot');
  }

  #setTabContent(tab: string): void {
    const contentEl = this.querySelector(`[${TAB_PANEL_ATTR}="${tab}"]`);
    if (!contentEl) return;
    contentEl.setAttribute('slot', TABPANEL_SLOT);
  }
}

define_webc('cx-tabs', Tabs);

declare global {
  interface HTMLElementTagNameMap {
    'cx-tabs': Tabs;
  }

  interface GlobalEventHandlersEventMap {
    'tab-change': TabChangeEvent;
  }
}
