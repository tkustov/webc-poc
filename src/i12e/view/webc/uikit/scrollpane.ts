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
  #dragState?: SliderDragState;

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
    this.addEventListener('mousedown', this.#handleWheelTilt, { passive: true });
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
        const vRatio = this.clientHeight / this.#pane.scrollHeight;
        const hRatio = this.clientWidth / this.#pane.scrollWidth;
        const vsize = vRatio * (this.#vtrack.clientHeight);
        const hsize = hRatio * (this.#htrack.clientWidth);
        this.#vslider.style.setProperty('height', `${Math.ceil(vsize)}px`);
        this.#hslider.style.setProperty('width', `${Math.ceil(hsize)}px`);
        if (Math.abs(vRatio - 1) < 0.0001) {
          this.#vtrack.style.setProperty('display', 'none');
        } else {
          this.#vtrack.style.removeProperty('display');
        }
        if (Math.abs(hRatio - 1) < 0.0001) {
          this.#htrack.style.setProperty('display', 'none');
        } else {
          this.#htrack.style.removeProperty('display');
        }
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

  #handleWheelTilt = (event: MouseEvent) => {
    // TODO: handle wheel tilt to horizontal scroll
    // console.log(event);
  };

  #handleVsliderDown = (event: MouseEvent) => {
    const vtRect = this.#vtrack.getBoundingClientRect();
    const vsRect = this.#vslider.getBoundingClientRect();
    this.setAttribute('scrolling', 'drag-slider');
    this.#dragState = {
      axis: 'y',
      start: event.clientY,
      min: vtRect.top,
      max: vtRect.bottom - vsRect.height,
      pivot: event.clientY - vsRect.top
    };
    window.addEventListener('mousemove', this.#handleVsliderDrag, { passive: false });
    window.addEventListener('mouseup', this.#handleVsliderDrop, { passive: true });
    window.addEventListener('blur', this.#handleVsliderDrop, { passive: true });
  };

  #handleVsliderDrag = (event: MouseEvent) => {
    if (!this.#dragState || this.#dragState.axis !== 'y') return;
    event.preventDefault();
    const sliderTop = Math.max(this.#dragState.min, Math.min(event.clientY - this.#dragState.pivot, this.#dragState.max)) - this.#dragState.min;
    this.#vslider.style.setProperty('top', `${sliderTop}px`);
    this.#pane.scrollTo({
      behavior: 'instant',
      top: (this.#pane.scrollHeight - this.#pane.clientHeight) * sliderTop / (this.#dragState.max - this.#dragState.min)
    });
  };

  #handleVsliderDrop = () => {
    this.removeAttribute('scrolling');
    window.removeEventListener('mousemove', this.#handleVsliderDrag);
    window.removeEventListener('mouseup', this.#handleVsliderDrop);
    window.removeEventListener('blur', this.#handleVsliderDrop);
  };
}

define_webc('cx-scrollpane', Scrollpane);

interface SliderDragState {
  axis: 'y' | 'x';
  start: number;
  pivot: number;
  min: number;
  max: number;
}
