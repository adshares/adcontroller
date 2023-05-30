import theme from '../utils/theme';

export function* colorGenerator() {
  const colors = [
    '#36a2eb',
    '#ff6384',
    '#ffce56',
    '#ff9f40',
    '#4bc0c0',
    '#99c000',
    '#d0d0d0',
    '#ab2d2d',
    '#587e41',
    '#624691',
    '#d92767',
    '#88e3aa',
  ];

  let i = 0;
  while (true) {
    i = ++i % colors.length;
    yield {
      from: colors[i],
      to: colors[i],
    };
  }
}

export function getFlowChartData(sspIncomeData, dspExpenseData, adServerAddress) {
  const colorGeneratorInstance = colorGenerator();
  const colorByAddress = {};
  const data = [];
  const labels = {};
  for (const entry of sspIncomeData) {
    if (!colorByAddress.hasOwnProperty(entry.adsAddress)) {
      colorByAddress[entry.adsAddress] = colorGeneratorInstance.next().value;
    }
    const from = `DSP ${entry.adsAddress}`;
    data.push({
      from: from,
      to: adServerAddress,
      flow: entry.amount / 1e11,
      color: colorByAddress[entry.adsAddress].from,
    });
    labels[from] = entry.name;
    if (adServerAddress === entry.adsAddress) {
      labels[adServerAddress] = entry.name;
    }
  }
  for (const entry of dspExpenseData) {
    if (!colorByAddress.hasOwnProperty(entry.adsAddress)) {
      colorByAddress[entry.adsAddress] = colorGeneratorInstance.next().value;
    }
    const to = `SSP ${entry.adsAddress}`;
    data.push({
      from: adServerAddress,
      to: to,
      flow: entry.amount / 1e11,
      color: colorByAddress[entry.adsAddress].to,
    });
    labels[to] = entry.name;
    if (adServerAddress === entry.adsAddress) {
      labels[adServerAddress] = entry.name;
    }
  }

  const colorCallback = (c) => c.dataset.data[c.dataIndex]?.color || 0;
  const datasets = [];
  if (data.length > 0) {
    datasets.push({
      data,
      color: theme.palette.text.primary,
      colorFrom: colorCallback,
      colorTo: colorCallback,
      colorMode: 'to',
      labels,
    });
  }
  return { datasets };
}
