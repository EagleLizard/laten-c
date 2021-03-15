
export type range = [ number, number ];

export function scaleToRange(n: number, fromRange: range, toRange: range) {
  let fromMin: number, fromMax: number, toMin: number, toMax: number;
  let percent: number;
  [ fromMin, fromMax ] = fromRange;
  [ toMin, toMax ] = toRange;
  percent = (n - fromMin) / (fromMax - fromMin);
  return percent * (toMax - toMin) + toMin;
}

export function findOutlierIndices(vals: number[]): number[] {
  let idxTuples: [ number, number ][];
  let q1: number, q3: number, iqr: number,
    maxValue: number, minValue: number;
  let outlierTuples: [ number, number ][];
  // convert numbers to idx tuples
  if(vals.length < 4) {
    return [];
  }
  idxTuples = vals.map((val, idx) => [ val, idx ]);
  idxTuples.sort((a, b) => a[0] - b[0]);
  q1 = idxTuples[ Math.floor((vals.length / 4))][0];
  q3 = idxTuples[ Math.ceil((vals.length * (3 / 4)))][0];
  iqr = q3 - q1;
  maxValue = q3 + (iqr * 1.5);
  minValue = q1 - (iqr * 1.5);
  outlierTuples = [];
  for(let i = 0, currTuple: [ number, number ]; currTuple = idxTuples[i], i < idxTuples.length; ++i) {
    if(
      !(
        (currTuple[0] <= maxValue)
        && (currTuple[0] >= minValue)
      )
    ) {
      outlierTuples.push(currTuple);
    }
  }
  return outlierTuples.map(outlierTuple => outlierTuple[1]);
}
