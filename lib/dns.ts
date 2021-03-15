
import dns, { LookupAddress,  } from 'dns';
import { Timer } from './timer';

import { DEFAULT_DNS_TIMEOUT } from '../constants';

export interface DnsResolveOpts {
  timeoutMs: number;
}

export interface DnsLookupResult {
  addresses: LookupAddress[];
  ms: number;
}

export interface DnsResolveResult {
  addresses: string[],
  ms: number;
  // failed?: boolean;
}

export type ResolveIpVersion = '4' | '6';

const defaultDnsResolveOpts: DnsResolveOpts = {
  timeoutMs: DEFAULT_DNS_TIMEOUT,
};

export async function runLookup(hostname: string) {
  return new Promise<DnsLookupResult>((resolve, reject) => {
    let dnsLookupResult: DnsLookupResult, dnsOpts: dns.LookupAllOptions;
    let timer: Timer;
    timer = new Timer;
    dnsOpts = {
      all: true,
    };
    timer.start();
    dns.lookup(hostname, dnsOpts, (err, addresses) => {
      timer.stop();
      if(err) {
        return reject(err);
      }
      dnsLookupResult = {
        addresses,
        ms: timer.getDuration(),
      };
      resolve(dnsLookupResult);
    });
  });
}

export function runResolve(hostname: string, opts?: DnsResolveOpts) {
  opts = Object.assign({}, defaultDnsResolveOpts, opts);
  return new Promise<DnsResolveResult>((resolve, reject) => {
    let timer: Timer, dnsResolveResult: DnsResolveResult;
    timer = new Timer;
    timer.start();
    dns.resolve(hostname, (err, addresses) => {
      if(err) {
        return reject(err);
      }
      timer.stop();
      dnsResolveResult = {
        addresses,
        ms: timer.getDuration(),
      };
      resolve(dnsResolveResult);
    });
  });
}
