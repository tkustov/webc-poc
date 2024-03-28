import { create_template } from '../common/create_template';
import { define_webc } from '../common/define_webc';

const template = create_template(`
  <span id="content"></span>
  <ul>
    <li part="list-item">item1</li>
    <li part="list-item">item2</li>
  </ul>
  <style>
    :host::part(list-item) {
      color: blue;
    }
  </style>
`);

class Test2 extends HTMLElement implements CustomElementLifecycle {
  connectedCallback(): void {
    this.attachShadow({ mode: 'open' });
    if (!this.shadowRoot) return;
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    const content = this.shadowRoot.querySelector('#content');
    content!.innerHTML = this.tagName;
  }
}

define_webc('sp-test2', Test2);
