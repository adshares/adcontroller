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
  let tmp = value;
  value = tmp.indexOf('.') >= 0 ? tmp.substr(0, tmp.indexOf('.')) + tmp.substr(tmp.indexOf('.'), toFix + 1) : tmp;
  return value;
}

export { adsToClicks, clicksToAds, returnNumber, setDecimalPlaces };
