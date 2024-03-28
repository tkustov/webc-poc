interface StackFrame<V> {
  value: V;
  next?: StackFrame<V>;
}

export class Stack<V> {
  private top?: StackFrame<V>;
  private count: number = 0;

  push(value: V): void {
    const nextTop: StackFrame<V> = {
      value,
      next: this.top
    };
    this.top = nextTop;
    this.count += 1;
  }

  pop(): V | undefined {
    if (!this.top) return undefined;
    const value = this.top.value;
    this.top = this.top.next;
    this.count -= 1;
    return value;
  }

  get size(): number {
    return this.count;
  }
}

const stack = new Stack<number>();

stack.push(1);
stack.push(2);
stack.push(3);
stack.push(4);

while (stack.size > 0) {
  console.log(stack.pop());
}
