
import { DnsResolveResult, runResolve } from '../lib/dns';

export enum JOB_STATES {
  READY = 'READY',
  RUNNING = 'RUNNING',
  FINISHED = 'FINISHED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export type DnsJobCompleteHandler = (result: DnsResolveResult, timestamp: number) => void;
export type DnsJobErrorHandler = (error: any, timestamp: number) => void;
export type DnsJobCancelHandler = (timestamp: number) => void;

export type COMPLETE_STATUSES = JOB_STATES.FINISHED | JOB_STATES.FAILED | JOB_STATES.CANCELLED;

export class DnsJob {
  uri: string;
  startTimestampMs: number;
  private jobState: JOB_STATES;
  private completeHandler: DnsJobCompleteHandler;
  private errorHandler: DnsJobErrorHandler;
  private cancelHandler: DnsJobCancelHandler;

  constructor(uri: string) {
    this.jobState = JOB_STATES.READY;
    this.uri = uri;
  }

  get finished(): boolean {
    return this.jobState === JOB_STATES.CANCELLED
      || this.jobState === JOB_STATES.FAILED
      || this.jobState === JOB_STATES.FINISHED
    ;
  }

  run() {
    this.jobState = JOB_STATES.RUNNING;
    this.startTimestampMs = Date.now();
    runResolve(this.uri)
      .then(res => {
        if(
          (this.jobState === JOB_STATES.FAILED)
          || (this.jobState === JOB_STATES.CANCELLED)
        ) {
          return;
        }
        this.completeHandler(res, this.startTimestampMs);
        this.jobState = JOB_STATES.FINISHED;
      })
      .catch(err => {
        this.errorHandler(err, this.startTimestampMs);
        this.jobState = JOB_STATES.FAILED;
      });
  }

  cancel() {
    if(this.jobState !== JOB_STATES.RUNNING) {
      throw new Error(`Attempt to cancel in an invalid state: ${this.jobState} Cannot cancel a job that is not running.`);
    }
    this.jobState = JOB_STATES.CANCELLED;
    this.cancelHandler(this.startTimestampMs);
  }

  onCancel(cb: DnsJobCancelHandler) {
    this.cancelHandler = cb;
  }

  onComplete(cb: DnsJobCompleteHandler) {
    if(this.jobState !== JOB_STATES.READY) {
      throw new Error(`Invalid job state: ${this.jobState}. Cannot register complete callback on job that is running or finished.`);
    }
    this.completeHandler = cb;
  }

  onError(cb: DnsJobErrorHandler) {
    this.errorHandler = cb;
  }
}
