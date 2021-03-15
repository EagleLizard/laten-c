
import path from 'path';

export const CSV_LOG_DIRNAME = 'csv-logs';
export const BASE_PATH = path.resolve(__dirname, '..');
export const CSV_LOG_PATH = path.resolve(BASE_PATH, CSV_LOG_DIRNAME);

export const SLIDING_WINDOW_MOD = 0.25;

export const HOSTNAMES = [
  // 'www.qualtrics.com',
  // 'www.github.com',
  // 'news.ycombinator.com',
  // 'www.microsoft.com',
  // 'www.amazon.com',
  // 'www.salesforce.com',
  // 'www.npr.org',
  // 'www.yahoo.com',

  // 'www.zoom.us',
  // 'www.netflix.com',
  'www.google.com',
  'www.youtube.com',
  'www.baidu.com',
  'www.wikipedia.org',
  'www.usa.gov',
  'www.medium.com',
  'www.bloomberg.com',
  'www.cnn.com',
  'www.instagram.com',
  'www.facebook.com',
  'www.hbo.com',
  'www.hulu.com',
  'www.stackoverflow.com',
  'www.wolframalpha.com',
  'www.reddit.com',
  'www.twitch.tv',
  'www.office.com',
  'www.live.com',
  'www.instructure.com',
  'www.bing.com',
  'www.etsy.com',
  'www.adobe.com',
  'www.apple.com',
  'www.linkedin.com',
  'www.dropbox.com',
  'www.nytimes.com',
  'www.okta.com',
  'www.espn.com',
  'www.walmart.com',
  'www.twitter.com',
  'www.force.com',
  'www.indeed.com',
  'www.salesforce.com',
  'www.aliexpress.com',
  'www.wellsfargo.com',
  'www.imgur.com',
  'www.quizlet.com',
  'www.usps.com',
  'www.spotify.com',
  'www.weather.com',
  'www.ca.gov',
  'www.craigslist.org',
];

export const DEFAULT_DNS_TIMEOUT = 4000;
