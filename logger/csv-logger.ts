
import path from 'path';
import fs from 'fs';

import csvStringify, { Stringifier } from 'csv-stringify';

import { LatencyResult, LATENCY_STATUS } from '../latency-monitor/latency-result';
import { CSV_LOG_PATH } from '../constants';
import { exists, mkdirIfNotExist } from '../lib/files';
import { Writable } from 'stream';

type CsvHeaderRow = [
  string,
  string,
  string,
  string,
];

type CsvRow = [
  number,
  string,
  number,
  LATENCY_STATUS,
];

const CSV_HEADERS: CsvHeaderRow = [
  'timestamp',
  'uri',
  'ping_ms',
  'status',
];

export class CsvLogger {
  logFileTimestamp: string;
  logFileName: string;
  logFilePath: string;

  private csvWriteSteam: Writable;
  private stringifier: Stringifier;
  private constructor() {
    this.logFileTimestamp = getTimestamp();
    this.logFileName = getLogFileName(this.logFileTimestamp);
  }

  async write(record: LatencyResult) {
    let csvRow: CsvRow;
    await this.checkLogFile();
    csvRow = [
      record.startTimestamp,
      record.hostname,
      record.ms,
      record.status
    ];
    this._write(csvRow);
  }

  private _write(csvRow: CsvHeaderRow | CsvRow) {
    this.stringifier.write(csvRow);
  }

  async checkLogFile() {
    let currTimeStamp: string, nextLogFileName: string, logFilePath: string;
    let logFileExists: boolean;
    currTimeStamp = getTimestamp();
    if(
      (currTimeStamp === this.logFileTimestamp)
      && (this.csvWriteSteam !== undefined)
    ) {
      return;
    }// OKR-557044
    nextLogFileName = getLogFileName(currTimeStamp);
    this.logFileTimestamp = currTimeStamp;
    this.logFileName = nextLogFileName;
    this.logFilePath = path.resolve(CSV_LOG_PATH, this.logFileName);
    logFileExists = await exists(this.logFilePath);
    this.csvWriteSteam = fs.createWriteStream(this.logFilePath, {
      flags: 'a',
    });
    this.stringifier = csvStringify();
    this.stringifier.pipe(this.csvWriteSteam);
    if(!logFileExists) {
      console.log('writing headers');
      this._write(CSV_HEADERS);
    }
  }

  static async getCsvLogger(): Promise<CsvLogger> {
    let csvLogger: CsvLogger;
    await mkdirIfNotExist(CSV_LOG_PATH);
    csvLogger = new CsvLogger();
    return csvLogger;
  }
}

function getLogFileName(logFileTimestamp: string) {
  return `${logFileTimestamp}_log.csv`;
}

function getTimestamp() {
  let now: Date, year: number, month: number, day: number,
    hour: number, minute: number;
  now = new Date;
  year = now.getFullYear();
  month = now.getMonth() + 1;
  day = now.getDate();
  hour = now.getHours();
  // minute = now.getMinutes(); // only log new file on hour intervals
  minute = 0; // only log new file on hour intervals
  // second = 0; // only log new file on minute intervals
  return `${year}-${padTimeVal2(month)}-${padTimeVal2(day)}_${padTimeVal2(hour)}:${padTimeVal2(minute)}`;
}

function padTimeVal2(timeVal: number): string {
  return `${timeVal}`.padStart(2, '0');
}
