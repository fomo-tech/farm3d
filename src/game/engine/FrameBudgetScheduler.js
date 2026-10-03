/**
 * FrameBudgetScheduler.js
 * Global Frame-Budget Scheduler for Open-World Streaming & Asynchronous World Building.
 * 
 * Cooperative scheduling: individual iterator steps must remain small.
 * - Renders: ~8-10ms
 * - Game Logic / Physics: ~1-2ms
 * - Streaming & Mesh Instantiation: MAX 2.5ms
 * 
 * A synchronous step cannot be preempted; overruns are measured and reported.
 */

export class FrameBudgetScheduler {
  constructor(budgetMs = 2.5) {
    this.budgetMs = budgetMs;
    this.queue = [];
    this.stats = { steps: 0, maxStepMs: 0, lastBatchMs: 0, overruns: 0 };
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
      if (existingIdx >= 0) this.queue.splice(existingIdx, 1)[0].task.return?.();
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
        const stepStart = performance.now();
        windowSafeDebug()?.stage(`stream job: ${current.id || 'anonymous'}`);
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
        const stepMs = performance.now() - stepStart;
        this.stats.steps++;
        this.stats.maxStepMs = Math.max(this.stats.maxStepMs, stepMs);
        if (stepMs > 50) {
          this.stats.overruns++;
          windowSafeDebug()?.report(`${current.id}: ${stepMs.toFixed(1)}ms`, 'STREAM JOB OVERRUN');
        }
      } catch (err) {
        console.warn('[FrameBudgetScheduler] Lỗi khi xử lý tác vụ streaming:', err);
        windowSafeDebug()?.report(err, `STREAM JOB FAILED: ${current.id || 'anonymous'}`);
        current.task.return?.();
        finished = true;
      }

      if (finished) {
        this.queue.shift();
      }
    }
    this.stats.lastBatchMs = performance.now() - start;
  }

  cancel(id) {
    if (!id) return;
    const idx = this.queue.findIndex(item => item.id === id);
    if (idx >= 0) this.queue.splice(idx, 1)[0].task.return?.();
  }

  clear() {
    for (const item of this.queue) item.task.return?.();
    this.queue.length = 0;
  }

  getPendingCount() {
    return this.queue.length;
  }
  getStats() { return { ...this.stats, pending: this.queue.length }; }
}

function windowSafeDebug() { return typeof window === 'undefined' ? null : window.__farmDebug; }
