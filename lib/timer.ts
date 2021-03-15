
export class Timer {
  startMs: number;
  endMs: number;
  stopped: boolean;
  constructor() {
    this.stopped = false;
  }

  start() {
    if(this.stopped) {
      throw new Error('Cannot start a time that has been stopped.');
    }
    this.startMs = Date.now();
  }

  stop() {
    this.endMs = Date.now();
    this.stopped = true;
  }

  getDuration() {
    if(!this.stopped) {
      throw new Error('Cannot get the duration of a stopped Timer.');
    }
    return this.endMs - this.startMs;
  }

}
