export type Context<T> = {
  name: string;
  initialValue?: T;
};

export type UnknownContext = Context<unknown>;

export type ContextType<T extends UnknownContext> = T extends Context<infer V> ? V : never;

export type ContextCallback<T = unknown> = (value: T, unsubscribe?: () => void) => void;

export function createContext<T>(
  name: string,
  initialValue?: T
): Readonly<Context<T>> {
  return {
    name,
    initialValue
  };
}

export class ContextEvent<T extends UnknownContext = UnknownContext> extends Event {
  constructor(
    public readonly context: T,
    public readonly callback: ContextCallback<ContextType<T>>,
    public readonly subscribe: boolean = false
  ) {
    super("context-request", { bubbles: true, composed: true });
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    "context-request": ContextEvent<UnknownContext>;
  }
}
