
import { SLIDING_WINDOW_MOD } from '../constants';
import { LatencyResult } from '../latency-monitor/latency-result';
import { DnsResolveResult } from '../lib/dns';
import { scaleToRange } from '../util/math-util';

export function printAnalyze(records: LatencyResult[]) {
  let successMs: number, avgMs: number, minMs: number, maxMs: number,
    totalMs: number, totalAvgMs: number, failCount: number, failPercent: number,
    successCount: number;
  let outStr: string, failStr: string, totalMsStr: string;
  let successBarMin: number, successBarMax: number;
  let successBarVal: number, successBar: string;
  // let outlierIndices: number[];
  successBarMin = 1;
  successBarMax = 70;

  successMs = 0;
  totalMs = 0;
  minMs = Infinity;
  maxMs = -1;
  failCount = 0;
  successCount = 0;

  // outlierIndices = findOutlierIndices(
  //   records.map(record => record.ms)
  // );
  // process.stdout.write('\n\n\n');
  // console.log(
  //   outlierIndices.reduce((acc, curr) => {
  //     acc.push(records[curr].ms);
  //     return acc;
  //   }, []).join(', ')
  // );
  // process.stdout.write('\n\n');

  for(let i = 0, currRecord: LatencyResult; currRecord = records[i], i < records.length; ++i) {
    // let isOutlier: boolean;
    // isOutlier = outlierIndices.find(idx => i === idx) !== undefined;
    if(i > (records.length - (records.length * SLIDING_WINDOW_MOD))) {
      totalMs += currRecord.ms;
      if(currRecord.failed === true) {
        failCount++;
      } else {
        successMs += currRecord.ms;
        successCount++;
        if(currRecord.ms < minMs) {
          minMs = currRecord.ms;
        }
        if(currRecord.ms > maxMs) {
          maxMs = currRecord.ms;
        }
      }
    }
  }

  failPercent = (failCount / (successCount + failCount)) * 100;

  avgMs = successMs / successCount;
  totalAvgMs = totalMs / (successCount + failCount);
  successBarVal = Math.round(
    scaleToRange(avgMs, [ minMs, maxMs ], [ successBarMin, successBarMax ])
  );
  successBar = `|${'='.repeat(successBarVal)}${' '.repeat(successBarMax - successBarVal)}|`;
  outStr = `  ${records.length} - [min, max]:[ ${minMs.toFixed(1)}, ${maxMs.toFixed(1)} ] ${avgMs.toFixed(2)}ms ${successBar}`;
  failStr = `  ${failPercent.toFixed(2)}%`;
  totalMsStr = `  ${totalAvgMs.toFixed(2)}ms`;
  queueMicrotask(() => {
    process.stdout.clearLine(undefined);  // clear current text
    process.stdout.write(outStr);
    process.stdout.write('\n');
    process.stdout.write(totalMsStr);
    process.stdout.write('\n');
    process.stdout.write(failStr);
    process.stdout.write('\n');
    process.stdout.moveCursor(0, -3);
  });
}
