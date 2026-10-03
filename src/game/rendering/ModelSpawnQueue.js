export class ModelSpawnQueue {
  constructor(schedule = callback => setTimeout(callback, 16)) {
    this.jobs = [];
    this.scheduled = false;
    this.disposed = false;
    this.schedule = schedule;
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
    // Skip cancelled jobs promptly instead of charging 16ms to each dead node.
    while (this.jobs.length && allowed < 4 && inspected++ < 128) {
      const job = this.jobs.shift();
      const valid = job.relevant();
      job.resolve(valid);
      if (valid) { allowed++; if (job.priority > 0) break; }
    }
    if (this.jobs.length) this.schedule(() => this.flush());
    else this.scheduled = false;
  }
  dispose() {
    this.disposed = true;
    this.jobs.splice(0).forEach(job => job.resolve(false));
  }
}
