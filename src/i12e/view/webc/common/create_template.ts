export function create_template(content: string): HTMLTemplateElement {
  const template = document.createElement('template');
  template.innerHTML = content;
  return template;
}
