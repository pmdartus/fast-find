export class LinkedList {
  head = null;
  tail = null;
  size = 0;

  get isEmpty() {
    return this.size === 0;
  }

  add(value) {
    const node = new LinkedListNode(value);

    if (this.head === null) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }

    this.size += 1;
  }

  remove() {
    if (this.head === null) {
      return null;
    }

    const value = this.head.value;
    this.head = this.head.next;
    this.size -= 1;

    if (this.head === null) {
      this.tail = null;
    }

    return value;
  }
}

class LinkedListNode {
  constructor(value, next = null) {
    this.value = value;
    this.next = next;
  }
}
