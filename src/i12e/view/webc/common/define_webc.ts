export function define_webc(tag_name: string, ctor: CustomElementConstructor, options?: ElementDefinitionOptions): void {
  const definition = window.customElements.get(tag_name);
  if (!definition) {
    window.customElements.define(tag_name, ctor, options);
  }
}
