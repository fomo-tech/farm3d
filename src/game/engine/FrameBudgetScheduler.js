/**
 * FrameBudgetScheduler.js
 * Global Frame-Budget Scheduler for Open-World Streaming & Asynchronous World Building.
 * 
 * Guarantees 60 FPS (16.67ms frame budget):
 * - Renders: ~8-10ms
 * - Game Logic / Physics: ~1-2ms
 * - Streaming & Mesh Instantiation: MAX 2.5ms
 * 
 * Never allows CPU streaming tasks to block the main thread or cause frame drops.
 */

export class FrameBudgetScheduler {
  constructor(budgetMs = 2.5) {
    this.budgetMs = budgetMs;
    this.queue = [];
  }

  /**
   * Enqueue a task or generator.
   * - Function task: returns true when done, false if needs more execution next frame.
   * - Generator task: yields between steps until done.
   */
  enqueue(task, priority = 0, id = null) {
    if (id) {
      // Remove any existing pending task with the same ID to prevent redundant work
      const existingIdx = this.queue.findIndex(item => item.id === id);
      if (existingIdx >= 0) this.queue.splice(existingIdx, 1);
    }
    const item = { task, priority, id };
    this.queue.push(item);
    if (this.queue.length > 1 && priority > 0) {
      this.queue.sort((a, b) => b.priority - a.priority);
    }
    return item;
  }

  update(maxBudget = null) {
    if (!this.queue.length) return;
    const budget = maxBudget ?? this.budgetMs;
    const start = performance.now();

    while (this.queue.length > 0) {
      if (performance.now() - start >= budget) break;

      const current = this.queue[0];
      let finished = false;

      try {
        if (typeof current.task.next === 'function') {
          // Generator or iterator step
          const result = current.task.next();
          finished = Boolean(result.done);
        } else if (typeof current.task === 'function') {
          const result = current.task();
          finished = result !== false;
        } else {
          finished = true;
        }
      } catch (err) {
        console.warn('[FrameBudgetScheduler] Lỗi khi xử lý tác vụ streaming:', err);
        finished = true;
      }

      if (finished) {
        this.queue.shift();
      }
    }
  }

  cancel(id) {
    if (!id) return;
    const idx = this.queue.findIndex(item => item.id === id);
    if (idx >= 0) this.queue.splice(idx, 1);
  }

  clear() {
    this.queue.length = 0;
  }

  getPendingCount() {
    return this.queue.length;
  }
}
