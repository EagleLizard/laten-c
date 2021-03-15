
import { DnsResolveResult } from '../lib/dns';
import { LatencyResult } from './latency-result';
import { DnsJob } from './dns-job';
import { sleep } from '../util/sleep';

export interface LatencyMonitorOpts {
  hostnames: string[];
  waitMs: number;
  timeoutMs: number;
}

export class LatencyMonitor {
  hostnames: string[];
  private jobMap: Map<string, DnsJob>;
  private waitMs: number;
  private timeoutMs: number;
  private onCompleteCb: (hostname: string, result: LatencyResult) => Promise<void>;
  private onTimeoutCb: (hostname: string, result: LatencyResult) => Promise<void>;
  private onErrorCb: (hostname: string, dnsResult: LatencyResult, err: any) => Promise<void>;

  constructor(
    opts: LatencyMonitorOpts,
    onCompleteCb: (hostname: string, dnsResult: LatencyResult) => Promise<void>,
    onTimeoutCb: (hostname: string, dnsResult: LatencyResult) => Promise<void>,
    onErrorCb: (hostname: string, dnsResult: LatencyResult, err: any) => Promise<void>,
  ) {
    this.hostnames = opts.hostnames;
    this.waitMs = opts.waitMs;
    this.timeoutMs = opts.timeoutMs;
    this.jobMap = initJobMap(this.hostnames);
    this.startJob = this.startJob.bind(this);
    this.onCompleteCb = onCompleteCb;
    this.onTimeoutCb = onTimeoutCb;
    this.onErrorCb = onErrorCb;
  }

  async start() {
    let staggerMs: number;
    staggerMs = Math.round(this.waitMs / this.hostnames.length);
    if(staggerMs < 1) {
      staggerMs = 1;
    }
    for(let i = 0, currHostname: string; currHostname = this.hostnames[i], i < this.hostnames.length; ++i) {
      this.startJob(currHostname);
      await sleep(staggerMs);
    }
    // this.hostnames.forEach(this.startJob);
  }

  private startJob(hostname: string) {
    let dnsJob: DnsJob;
    let startMs: number, endMs: number, deltaMs: number;
    dnsJob = new DnsJob(hostname);
    dnsJob.onComplete(res => {
      endMs = Date.now();
      deltaMs = endMs - startMs;
      this.handleComplete(hostname, res, deltaMs, dnsJob.startTimestampMs);
      this.jobMap.set(hostname, new DnsJob(hostname));
    });
    dnsJob.onCancel(async () => {
      await this.handleTimeout(hostname, dnsJob.startTimestampMs);
      this.startJob(hostname);
    });
    dnsJob.onError(async err => {
      await this.handleError(hostname, dnsJob.startTimestampMs, err);
      this.startJob(hostname);
    });
    this.jobMap.set(hostname, dnsJob);
    startMs = Date.now();
    dnsJob.run();
    setTimeout(() => {
      if(dnsJob.finished) {
        return;
      }
      dnsJob.cancel();
    }, this.timeoutMs);
  }

  private async handleComplete(hostname: string, dnsResolveResult: DnsResolveResult, deltaMs: number, startTimestamp: number) {
    let waitForMs: number, latencyResult: LatencyResult;
    waitForMs = ((this.waitMs - deltaMs) > 1)
      ? this.waitMs - deltaMs
      : 0
    ;
    latencyResult = new LatencyResult(hostname, dnsResolveResult.ms, false, startTimestamp);
    await this.onCompleteCb(hostname, latencyResult);
    setTimeout(() => {
      this.startJob(hostname);
    }, waitForMs);
  }

  private async handleTimeout(hostname: string, startTimestamp: number) {
    let resolveResult: LatencyResult;
    resolveResult = new LatencyResult(hostname, this.timeoutMs, true, startTimestamp);
    await this.onTimeoutCb(hostname, resolveResult);
  }

  private async handleError(hostname: string, startTimestamp: number, err: any) {
    let resolveResult: LatencyResult;
    resolveResult = new LatencyResult(hostname, this.timeoutMs, true, startTimestamp);
    this.onErrorCb(hostname, resolveResult, err);
  }
}

function initJobMap(hostnames: string[]): Map<string, DnsJob> {
  return hostnames.reduce((acc, curr) => {
    acc.set(curr, new DnsJob(curr));
    return acc;
  }, new Map<string, DnsJob>());
}
