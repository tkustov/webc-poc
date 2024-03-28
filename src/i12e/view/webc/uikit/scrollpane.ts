import { create_template } from '../common/create_template';
import { define_webc } from '../common/define_webc';

const template = create_template(`
  <div id="pane">
    <slot></slot>
  </div>
  <div id="vtrack" part="track">
    <div id="vslider part="slider">
      <slot name="slider"></slot>
    </div>
  </div>
  <div id="htrack" part="track">
    <div id="hslider" part="slider">
      <slot name="slider"></slot>
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
    overflow: hidden;
  }
  #vtrack {
    position: absolute !important;
    right: 0;
    top: 0;
    width: var(--cx-scrollpane-track-size) !important;
    height: 100%;
  }
  #htrack {
    position: absolute !important;
    height: var(--cx-scrollpane-track-size) !important;
    left: 0;
    bottom: 0;
  }
  </style>
`);

export class Scrollpane extends HTMLElement implements CustomElementLifecycle {
  #resizeObserver: ResizeObserver;
  #vtrack: HTMLElement;
  #vslider: HTMLElement;
  #htrack: HTMLElement;
  #hslider: HTMLElement;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.#vtrack = this.shadowRoot?.getElementById('vtrack')!;
    this.#vslider = this.shadowRoot?.getElementById('vslider')!;
    this.#htrack = this.shadowRoot?.getElementById('htrack')!;
    this.#hslider = this.shadowRoot?.getElementById('hslider')!;
    this.#resizeObserver = new ResizeObserver(this.#handleSizeChange);
  }

  get #pane(): HTMLElement {
    return this.shadowRoot?.getElementById('pane')!;
  }

  connectedCallback(): void {
    this.#resizeObserver.observe(this.#pane);
    this.addEventListener('wheel', this.#handleWheel, { passive: true });
    this.addEventListener('mousedown', this.#handleMouseDown, { passive: true });
  }

  #handleSizeChange: ResizeObserverCallback = (entries) => {
    //
  };

  #handleWheel = (event: MouseEvent) => {
    console.log(event);
  };

  #handleMouseDown = (event: MouseEvent) => {
    console.log(event);
  };
}

define_webc('cx-scrollpane', Scrollpane);
