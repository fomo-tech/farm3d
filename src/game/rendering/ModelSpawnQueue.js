export class ModelSpawnQueue {
  constructor(schedule = callback => setTimeout(callback, 16), { budgetMs = 2.5, now = () => performance.now() } = {}) {
    this.jobs = [];
    this.scheduled = false;
    this.disposed = false;
    this.schedule = schedule;
    this.now = now;
    this.budgetMs = budgetMs;
    this.stats = { completed: 0, cancelled: 0, maxJobMs: 0, overruns: 0 };
  }
  run(work, priority = 0, relevant = () => true, label = 'model instance') {
    if (this.disposed) return Promise.resolve(false);
    return new Promise((resolve, reject) => {
      const job = { work, resolve, reject, relevant, priority, label };
      const index = this.jobs.findIndex(item => item.priority < priority);
      if (index < 0) this.jobs.push(job); else this.jobs.splice(index, 0, job);
      if (!this.scheduled) { this.scheduled = true; this.schedule(() => this.flush()); }
    });
  }
  request(priority = 0, relevant = () => true) {
    if (this.disposed) return Promise.resolve(false);
    return new Promise(resolve => {
      const job = { resolve, relevant, priority };
      const index = priority > 0 ? this.jobs.findIndex(item => item.priority < priority) : -1;
      if (index < 0) this.jobs.push(job); else this.jobs.splice(index, 0, job);
      if (!this.scheduled) { this.scheduled = true; this.schedule(() => this.flush()); }
    });
  }
  flush() {
    if (this.disposed) return;
    let allowed = 0;
    let inspected = 0;
    const start = this.now();
    // Skip cancelled jobs promptly instead of charging 16ms to each dead node.
    while (this.jobs.length && allowed < 4 && inspected++ < 128 && this.now() - start < this.budgetMs) {
      const job = this.jobs.shift();
      let valid = false;
      try {
        valid = job.relevant();
        if (valid && job.work) {
          const jobStart = this.now();
          if (typeof window !== 'undefined') window.__farmDebug?.stage(job.label);
          job.resolve(job.work());
          const elapsed = this.now() - jobStart;
          this.stats.maxJobMs = Math.max(this.stats.maxJobMs, elapsed);
          if (elapsed > 50) this.stats.overruns++;
          this.stats.completed++;
        } else { job.resolve(valid); if (!valid) this.stats.cancelled++; }
      } catch (error) { job.reject?.(error); if (!job.reject) job.resolve(false); }
      if (valid) { allowed++; if (job.priority > 0) break; }
    }
    if (this.jobs.length) this.schedule(() => this.flush());
    else this.scheduled = false;
  }
  getStats() { return { ...this.stats, pending: this.jobs.length }; }
  dispose() {
    this.disposed = true;
    this.jobs.splice(0).forEach(job => job.resolve(false));
  }
}
