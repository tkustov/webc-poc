import { ContextEvent } from '../common/context-protocol';
import { create_template } from '../common/create_template';
import { define_webc } from '../common/define_webc';
import { test_ctx } from '../contexts';

const template = create_template(`
  <span id="content" class="span">test1</span>
  <style>
    .span {
      color: var(--test1-span-color, red);
    }
  </style>
`);

class Test1 extends HTMLElement implements CustomElementLifecycle {
  connectedCallback(): void {
    this.attachShadow({ mode: 'open' });
    if (!this.shadowRoot) return;
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    const content = this.shadowRoot.querySelector('#content');
    content!.innerHTML = this.tagName;
    const event = new ContextEvent(test_ctx, this.handleContext);
    this.dispatchEvent(event);
  }

  private handleContext = (value: { value_a: number; value_b: string; }) => {
    this.shadowRoot?.appendChild(document.createTextNode(value.value_a.toString(10)));
    this.shadowRoot?.appendChild(document.createTextNode(value.value_b));
  };
}

define_webc('sp-test1', Test1);
