/// <reference path="./common/webc.d.ts" />

import { ContextCallback, ContextEvent, UnknownContext } from './common/context-protocol';
import { define_webc } from './common/define_webc';
import { test_ctx } from './contexts';
import './shared/test1';
import './shared/test2';

const VIEW_MAP = [
  {
    type: 'test.test1',
    tag_name: 'sp-test1',
    predicate: (ctx: any) => ctx.value_b === 'abc'
  },
  {
    type: 'test.test1',
    tag_name: 'sp-test2',
    predicate: (ctx: any) => ctx.value_b !== 'abc'
  }
];

const CONTEXT_MAP = new Map<string, { context: UnknownContext; value: any; }>();

CONTEXT_MAP.set('325', {
  context: test_ctx,
  value: {
    value_a: 1,
    value_b: 'abc'
  }
});

CONTEXT_MAP.set('326', {
  context: test_ctx,
  value: {
    value_a: 15,
    value_b: 'abd'
  }
});

console.log(VIEW_MAP);

class Activity extends HTMLElement implements CustomElementLifecycle {
  static observedAttributes = ['type', 'context'];

  private callbackMap: WeakMap<UnknownContext, ContextCallback[]> = new WeakMap();
  private content?: HTMLElement = undefined;

  // @ts-ignore
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (newValue === oldValue) return;
    this.refresh();
  }

  connectedCallback(): void {
    this.addEventListener('context-request', this.handleContextRequest);
    this.refresh();
  }

  disconnectedCallback(): void {
    this.removeEventListener('context-request', this.handleContextRequest);
  }

  private refresh(): void {
    const type = this.getAttribute('type');
    const ctxId = this.getAttribute('context');
    const ctxItem = ctxId ? CONTEXT_MAP.get(ctxId) : undefined;
    const item = VIEW_MAP.find(item => {
      return item.type === type && ctxItem && item.predicate(ctxItem?.value);
    });
    if (!type || !ctxId || !ctxItem || !item) {
      if (this.content) {
        this.removeChild(this.content);
        this.content = undefined;
      }
      return;
    }
    if (item.tag_name.toUpperCase() !== this.content?.tagName) {
      if (this.content) {
        this.removeChild(this.content!);
      }
      this.content = document.createElement(item.tag_name);
      this.appendChild(this.content);
    }
  }

  private handleContextRequest = (event: ContextEvent): void => {
    const ctxId = this.getAttribute('context');
    if (!ctxId) return;
    const ctxItem = CONTEXT_MAP.get(ctxId);
    if (!ctxItem || event.context !== ctxItem.context) return;
    event.stopPropagation();
    if (!event.subscribe) {
      event.callback(ctxItem.value);
    }
  };
}

define_webc('sp-activity', Activity);
