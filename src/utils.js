function StringToArray(str) {
  return Buffer.from(str);
}

function ArrayToString(arr) {
  return Buffer.from(arr).toString();
}

function CapitalizeFirstLetter(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function GetRand(modulus) {
  return Math.floor(Math.random() * modulus);
}

function GetHashFromString(word) {
  var hash = 0,
    i,
    chr;
  if (word.length === 0) return hash;
  for (i = 0; i < word.length; i++) {
    chr = word.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

// Get angle from x2 y2 to x1 y1
function GetAngle(x1, x2, y1, y2) {
  var deltaX = x1 - x2;
  var deltaY = y1 - y2;
  var mouseAngle = 0;
  if (Math.abs(deltaX) < 0.0001) mouseAngle = deltaY > 0 ? 90 : -90;
  else {
    mouseAngle = (Math.atan(deltaY / deltaX) * 180) / Math.PI; // [-Pi/2;Pi/2]
    if (deltaX < 0) mouseAngle += 180;
  }
  // Angle has to be between 0 and 360
  mouseAngle += 360;
  mouseAngle %= 360;
  return mouseAngle;
}

function GetTime() {
  var d = new Date();
  return d.getTime();
}

// NOTE: This is not exactly lower bound as we are returning the last element if
// the key is too big
function lowerBoundIndexBeginEnd(array, begin, end, key, greaterOrEqThan) {
  let length = array.length;
  if (begin >= length) return length;
  if (greaterOrEqThan(array[begin], key)) return begin;
  if (begin > end) return end;
  if (begin == end) return begin + 1;

  let mid = Math.floor((begin + end + 1) / 2);

  if (greaterOrEqThan(array[mid], key))
    return lowerBoundIndexBeginEnd(array, begin, mid - 1, key, greaterOrEqThan);
  return lowerBoundIndexBeginEnd(array, mid, end, key, greaterOrEqThan);
}

function LowerBoundIndex(array, key, greaterOrEqThan) {
  let length = array.length;
  if (greaterOrEqThan == undefined) {
    greaterOrEqThan = (a, b) => {
      return a >= b;
    };
  }
  let ret = lowerBoundIndexBeginEnd(array, 0, length - 1, key, greaterOrEqThan);
  return ret == length ? ret - 1 : ret;
}

function GetLastKeyInMap(map) {
  return Array.from(map)[map.size - 1][0];
}
function GetLastValueInMap(map) {
  return Array.from(map)[map.size - 1][1];
}

function RandomString() {
  return Math.random()
    .toString(36)
    .substring(7);
}

function ShrinkString(s, n) {
  return s.length > n ? s.slice(0, n - 1) : s.slice(0);
}

function RandomUniqueString(dict) {
  while (true) {
    let key = RandomString();
    if (!(key in dict)) return key;
  }
}

function WeightedSumm(a, b, factor) {
  return (1 - factor) * a + factor * b;
}

function VectorProduct(rx, ry, sx, sy) {
  return rx * sy - sx * ry;
}

function IntersectLines(px1, py1, px2, py2, qx1, qy1, qx2, qy2) {
  // p
  let rx = px2 - px1;
  let ry = py2 - py1;

  // q
  let sx = qx2 - qx1;
  let sy = qy2 - qy1;

  let vp = VectorProduct(rx, ry, sx, sy);

  // parallel
  if (vp == 0) return { intersect: false };

  // t = (q − p) × s / (r × s)
  let t = VectorProduct(qx1 - px1, qy1 - py1, sx, sy) / vp;

  // u = (q − p) × r / (r × s)
  let u = VectorProduct(qx1 - px1, qy1 - py1, rx, ry) / vp;

  // do not intersect
  if (t < 0 || t > 1 || u < 0 || u > 1) return { intersect: false };

  //console.log("t: " + t + " x: " + (px1 + t * rx) + " y: " + (py1 + t * ry));
  //console.log("u: " + u + " x: " + (qx1 + u * sx) + " y: " + (qy1 + u * sy));

  // intersect
  return { intersect: true, x: px1 + t * rx, y: py1 + t * ry };
}

function DoBoxesOverlap(
  leftX1,
  bottomY1,
  rightX1,
  topY1,
  leftX2,
  bottomY2,
  rightX2,
  topY2
) {
  return !(
    leftX2 > rightX1 ||
    rightX2 < leftX1 ||
    bottomY2 > topY1 ||
    topY2 < bottomY1
  );
}

function ShuffleArray(a) {
  let b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function GetNaturalArrayWZero(n) {
  let x = [];
  for (let i = 0; i < n; i++) x.push(i);
  return x;
}

export {
  GetAngle,
  GetTime,
  LowerBoundIndex,
  GetLastValueInMap,
  GetLastKeyInMap,
  RandomString,
  RandomUniqueString,
  WeightedSumm,
  GetHashFromString,
  GetRand,
  DoBoxesOverlap,
  CapitalizeFirstLetter,
  ShuffleArray,
  GetNaturalArrayWZero,
  ShrinkString,
};
