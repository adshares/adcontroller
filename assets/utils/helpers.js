function adsToClicks(amount) {
  if (typeof amount === 'number') {
    amount = amount.toFixed(12);
  }

  let arr = amount.split('.');
  arr[1] = arr[1].padEnd(11, '0').substring(0, 11);

  return parseInt(arr[0] + arr[1]);
}

function clicksToAds(amount) {
  return amount / 1e11;
}

function returnNumber(value) {
  return Number(value.toString().replace(',', '.'));
}

function setDecimalPlaces(value, toFix = 2) {
  let tmp = value.toString();
  value = tmp.indexOf('.') >= 0 ? tmp.substr(0, tmp.indexOf('.')) + tmp.substr(tmp.indexOf('.'), toFix + 1) : tmp;
  return value;
}

function formatMoney(value, precision = 11, trim = false, decimal = '.', thousand = ',') {
  const r = trim;
  const p = Math.max(precision, 2);
  const d = decimal;
  const t = thousand;
  let v = (value || '0') + '';

  let s = '';
  if (value < 0) {
    s = '-';
    v = v.substr(1);
  }

  v = v.padStart(11, '0');
  const l = v.length - 11;
  let a = v.substr(0, l) || '0';
  const j = a.length > 3 ? a.length % 3 : 0;
  let b = Math.round(parseInt((v + '0').substr(l, p + 1)) / 10).toString();
  if (b.length > p) {
    b = '0';
    a = (parseInt(a) + 1).toString();
  }
  b = b.padStart(p, '0');
  if (r) {
    b = b.replace(/([0-9]{2})0+$/, '$1');
  }

  return s + (j ? a.substr(0, j) + t : '') + a.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + d + b;
}

export { adsToClicks, clicksToAds, returnNumber, setDecimalPlaces, formatMoney };
function compareArrays(array1, array2) {
  if (!array1 || !array2) return false;

  if (array1.length !== array2.length) return false;

  for (let i = 0, l = array1.length; i < l; i++) {
    if (array1[i] instanceof Array && array2[i] instanceof Array) {
      if (!array1[i].equals(array2[i])) return false;
    } else if (array1[i] !== array2[i]) {
      return false;
    }
  }
  return true;
}

export { adsToClicks, clicksToAds, returnNumber, setDecimalPlaces, compareArrays };
