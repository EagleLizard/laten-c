
import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import { sleep } from './util/sleep';
import { CsvLogger } from './logger/csv-logger';

import {
  HOSTNAMES,
} from './constants';
import { printAnalyze } from './util/print-analyze';
import { LatencyMonitor } from './latency-monitor/latency-monitor';
import { LatencyResult } from './latency-monitor/latency-result';

const DNS_TIMEOUT_MAX_MS = 4000;
const MONITOR_INTERVAL_MS = 10;
const WAIT_MS = 300;
// const STACK_SLICE_MOD = 0.0625;
const STACK_SLICE_MOD = 0.125;
const STACK_LIMIT = 2560;
// const STACK_LIMIT = 4096;
// const STACK_LIMIT = 8192;

(async () => {
  try {
    await main();
  } catch(e) {
    console.error(e);
    throw e;
  }
})();

async function main() {
  await startMonitor();
}

async function startMonitor() {
  let latencyMonitor: LatencyMonitor, csvLogger: CsvLogger;
  let records: LatencyResult[];
  csvLogger = await CsvLogger.getCsvLogger();
  console.log(csvLogger);
  records = [];
  const onCompleteCb = async (hostname: string, latencyResult: LatencyResult) => {
    records.push(latencyResult);
    await csvLogger.write(latencyResult);
  };
  const onTimeoutCb = async (hostname: string, latencyResult: LatencyResult) => {
    records.push(latencyResult);
    await sleep(Math.round(DNS_TIMEOUT_MAX_MS / 4));
    await csvLogger.write(latencyResult);
  };
  const onErrorCb = async (hostname: string, latencyResult: LatencyResult, err: any) => {
    console.error('\n');
    console.error(hostname);
    console.error(err);
    records.push(latencyResult);
    await sleep(Math.round(DNS_TIMEOUT_MAX_MS / 4));
    await csvLogger.write(latencyResult);
  };
  latencyMonitor = new LatencyMonitor({
    hostnames: HOSTNAMES,
    waitMs: WAIT_MS,
    timeoutMs: DNS_TIMEOUT_MAX_MS,
  }, onCompleteCb, onTimeoutCb, onErrorCb);
  latencyMonitor.start();
  for(;;) {
    await sleep(MONITOR_INTERVAL_MS);
    printAnalyze(records);
    if(records.length > STACK_LIMIT) {
      records = records.slice(Math.round(STACK_LIMIT * STACK_SLICE_MOD));
    }
  }
}
