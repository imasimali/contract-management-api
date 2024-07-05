class SimpleQueue {
  constructor() {
    this.tasks = [];
    this.isProcessing = false;
  }

  async enqueue(task) {
    this.tasks.push(task);
    if (!this.isProcessing) {
      this.process();
    }
  }

  async process() {
    this.isProcessing = true;
    while (this.tasks.length > 0) {
      const task = this.tasks.shift();
      await task();
    }
    this.isProcessing = false;
  }
}

module.exports = SimpleQueue;