/**
 * Query scope's children for one matches selector
 * @param scope scope for query
 * @param selector selector, same as for querySelector
 * @returns found child or undefined
 */
export function qchone(scope: Element, selector: string): Element | undefined {
  for (const child of scope.children) {
    if (child.matches(selector)) return child;
  }
  return undefined;
}

/**
 * Query scope for all children matches selector
 * @param scope scope for query
 * @param selector selector, same as for querySelector
 * @returns
 */
export function qchall(scope: Element, selector: string): Element[] {
  const found: Element[] = [];
  for (const child of scope.children) {
    if (child.matches(selector)) {
      found.push(child);
    }
  }
  return found;
}

export function qone(scope: Element, selector: string): Element | undefined {
  return scope.querySelector(selector) ?? undefined;
}

export function qall(scope: Element, selector: string): Element[] {
  return Array.from(scope.querySelectorAll(selector));
}
