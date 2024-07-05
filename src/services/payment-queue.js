class PaymentQueueService {
  constructor() {
    this.queue      = [];
    this.processing = false;
  }

  enqueue(task) {
    this.queue.push(task);
    this.processQueue();
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    const task      = this.queue.shift();

    try {
      await task();
    } catch (err) {
      console.error('Task failed', err);
    } finally {
      this.processing = false;
      this.processQueue();
    }
  }
}

module.exports = { PaymentQueueService };
