
export enum LATENCY_STATUS {
  PASS = 0,
  FAIL = 1,
}

export class LatencyResult {
  hostname: string;
  ms: number;
  failed: boolean;
  startTimestamp: number;
  status: LATENCY_STATUS;
  constructor(hostname: string, ms: number, failed: boolean, startTimestamp: number) {
    this.hostname = hostname;
    this.ms = ms;
    this.failed = failed;
    this.startTimestamp = startTimestamp;
    this.status = this.failed
      ? LATENCY_STATUS.FAIL
      : LATENCY_STATUS.PASS
    ;
  }
}
