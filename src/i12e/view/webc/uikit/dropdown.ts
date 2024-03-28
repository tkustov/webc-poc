import { create_template } from '../common/create_template';
import { define_webc } from '../common/define_webc';
import { qchone } from '../common/dom-query';

const template = create_template(`
  <div id="trigger" part="trigger">
    <slot name="trigger"></slot>
  </div>
  <div id="content" part="content">
    <slot name="content"></slot>
  </div>
`);

export class Dropdown extends HTMLElement implements CustomElementLifecycle {
  static observedAttributes(): string[] {
    return ['state', 'position'];
  }

  #trigger!: HTMLElement;
  #content!: HTMLElement;

  connectedCallback(): void {
    const shadowRoot = this.attachShadow({ mode: 'open', delegatesFocus: true });
    shadowRoot.appendChild(template.content.cloneNode(true));
    this.#trigger = shadowRoot.getElementById('trigger')!;
    this.#content = shadowRoot.getElementById('content')!;
  }

  //
}

define_webc('cx-dropdown', Dropdown);
