
import { DnsResolveResult, runResolve } from './dns';
import { sleep } from '../util/sleep';

export interface DnsMonitorOpts {
  timeoutMs: number;
}

const MONITOR_INTERVAL_MS = 150;

export function dnsMonitor(hostname: string, opts: DnsMonitorOpts, dnsCb: (dnsResult: DnsResolveResult) => void): () => void {
  let doStop: boolean, stopCb: () => void, doStopCb: () => boolean;
  doStop = false;
  stopCb = () => {
    doStop = true;
  };
  doStopCb = () => {
    return doStop;
  };

  startDnsMonitor(hostname, opts, doStopCb, dnsCb);

  return stopCb;
}

async function startDnsMonitor(hostname: string, opts: DnsMonitorOpts, doStopCb: () => boolean, dnsCb: (dnsResult: DnsResolveResult) => void) {
  let startMs: number, endMs: number, deltaMs: number;
  let dnsResolveResult: DnsResolveResult;
  while(!doStopCb()) {
    startMs = Date.now();
    dnsResolveResult = await retryRunResolve(hostname, opts);
    dnsCb(dnsResolveResult);
    endMs = Date.now();
    deltaMs = endMs - startMs;
    if(deltaMs < MONITOR_INTERVAL_MS) {
      await sleep(MONITOR_INTERVAL_MS - deltaMs);
    }
  }
}

async function retryRunResolve(hostname: string, opts: DnsMonitorOpts) {
  let dnsResolveResult: DnsResolveResult;
  while(dnsResolveResult === undefined) {
    try {
      dnsResolveResult = await runResolve(hostname, {
        timeoutMs: opts.timeoutMs,
      });
    } catch(e) {
      if(e?.code !== '_TIMEOUT_') {
        throw e;
      }
    }
  }
  return dnsResolveResult;
}
