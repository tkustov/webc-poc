import { create_template } from '../common/create_template';
import { define_webc } from '../common/define_webc';

const template = create_template(`
  <div id="pane">
    <div id="content"><slot></slot></div>
  </div>
  <div id="vtrack" part="track">
    <div id="vslider" part="slider">
      <slot name="vslider"></slot>
    </div>
  </div>
  <div id="htrack" part="track">
    <div id="hslider" part="slider">
      <slot name="hslider"></slot>
    </div>
  </div>
  <style>
  @property --cx-scrollpane-track-size {
    syntax: "<length>";
    inherits: true;
    initial-value: 8px;
  }
  </style>
  <style>
  :host {
    display: block;
    position: relative;
    --cx-scrollpane-track-size: 8px;
  }
  #pane {
    overflow: hidden;
  }
  #vtrack {
    position: absolute !important;
    right: 0 !important;
    top: 0 !important;
    width: var(--cx-scrollpane-track-size) !important;
    height: calc(100% - var(--cx-scrollpane-track-size)) !important;
    pointer-events: none;
  }
  #vslider {
    position: absolute !important;
    left: 0 !important;
    width: var(--cx-scrollpane-track-size) !important;
    pointer-events: all;
    cursor: default;
  }
  #htrack {
    position: absolute !important;
    width: calc(100% - var(--cx-scrollpane-track-size)) !important;
    height: var(--cx-scrollpane-track-size) !important;
    left: 0 !important;
    bottom: 0 !important;
    pointer-events: none;
  }
  #hslider {
    position: absolute !important;
    top: 0 !important;
    height: var(--cx-scrollpane-track-size) !important;
    pointer-events: all;
  }
  #content {
  }
  </style>
`);

export class Scrollpane extends HTMLElement implements CustomElementLifecycle {
  #resizeObserver: ResizeObserver;
  #content: HTMLElement;
  #pane: HTMLElement;
  #vtrack: HTMLElement;
  #vslider: HTMLElement;
  #htrack: HTMLElement;
  #hslider: HTMLElement;
  #maxScrollTop: number = 0;
  #maxScrollLeft: number = 0;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#content = this.shadowRoot?.getElementById('content')!;
    this.#pane = this.shadowRoot?.getElementById('pane')!;
    this.#vtrack = this.shadowRoot?.getElementById('vtrack')!;
    this.#vslider = this.shadowRoot?.getElementById('vslider')!;
    this.#htrack = this.shadowRoot?.getElementById('htrack')!;
    this.#hslider = this.shadowRoot?.getElementById('hslider')!;
    this.#resizeObserver = new ResizeObserver(this.#handleSizeChange);
  }

  connectedCallback(): void {
    this.#resizeObserver.observe(this);
    this.#resizeObserver.observe(this.#content);
    this.addEventListener('wheel', this.#handleWheel, { passive: true });
    this.addEventListener('mousedown', this.#handleMouseDown, { passive: true });
    this.#vslider.addEventListener('mousedown', this.#handleVsliderDown, { passive: true });
  }

  scrollBy(...args: [x: number, y: number] | [options?: ScrollToOptions]): void {
    const left = (typeof args[0] === 'number' ? args[0] : args[0]?.left) ?? 0;
    const top = (typeof args[0] === 'number' ? args[1] : args[0]?.top) ?? 0;
    const behavior = typeof args[0] === 'number' ? undefined : args[0]?.behavior;
    this.#pane.scrollBy({
      left,
      top,
      behavior
    });
    this.#vslider.style.setProperty('top', `${
      Math.max(0, Math.min((this.#pane.scrollTop + top) / this.#pane.scrollHeight, this.#maxScrollTop)) * this.#vtrack.clientHeight
    }px`);
    this.#hslider.style.setProperty('left', `${
      Math.max(0, Math.min((this.#pane.scrollLeft + left) / this.#pane.scrollWidth, this.#maxScrollLeft)) * this.#htrack.clientWidth
    }px`);
  }

  #handleSizeChange: ResizeObserverCallback = (entries) => {
    for (const entry of entries) {
      if (entry.target === this) {
        this.#pane.style.setProperty('width', `${entry.contentRect.width}px`);
        this.#pane.style.setProperty('height', `${entry.contentRect.height}px`);
      }
      if (entry.target === this.#content) {
        const vsize = this.clientHeight / this.#pane.scrollHeight * (this.#vtrack.clientHeight);
        const hsize = this.clientWidth / this.#pane.scrollWidth * (this.#htrack.clientWidth);
        this.#vslider.style.setProperty('height', `${vsize}px`);
        this.#hslider.style.setProperty('width', `${hsize}px`);
        this.#maxScrollLeft = (this.#pane.scrollWidth - this.#pane.clientWidth) / this.#pane.scrollWidth;
        this.#maxScrollTop = (this.#pane.scrollHeight - this.#pane.clientHeight) / this.#pane.scrollHeight;
      }
    }
  };

  #handleWheel = (event: WheelEvent) => {
    this.scrollBy({
      behavior: 'instant',
      top: event.deltaY
    });
  };

  #handleMouseDown = (event: MouseEvent) => {
    // TODO: handle wheel tilt to horizontal scroll
    console.log(event);
  };

  #handleVsliderDown = (event: MouseEvent) => {
    console.log(event);
  };
}

define_webc('cx-scrollpane', Scrollpane);
