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

export function getChartOptions(title) {
  return {
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: !!title,
        text: title,
      },
    },
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
}

export function getFlowChartData(sspIncomeData, dspExpenseData, adServerAddress) {
  const colorGeneratorInstance = colorGenerator();
  const colorByAddress = {};
  const data = [];
  for (const entry of sspIncomeData) {
    if (!colorByAddress.hasOwnProperty(entry.adsAddress)) {
      colorByAddress[entry.adsAddress] = colorGeneratorInstance.next().value;
    }
    data.push({
      from: `DSP ${entry.adsAddress}`,
      to: adServerAddress,
      flow: entry.amount / 1e11,
      color: colorByAddress[entry.adsAddress].from,
    });
  }
  for (const entry of dspExpenseData) {
    if (!colorByAddress.hasOwnProperty(entry.adsAddress)) {
      colorByAddress[entry.adsAddress] = colorGeneratorInstance.next().value;
    }
    data.push({
      from: adServerAddress,
      to: `SSP ${entry.adsAddress}`,
      flow: entry.amount / 1e11,
      color: colorByAddress[entry.adsAddress].to,
    });
  }

  const colorCallback = (c) => c.dataset.data[c.dataIndex]?.color || 0;
  const datasets = [];
  if (data.length > 0) {
    datasets.push({
      data,
      colorFrom: colorCallback,
      colorTo: colorCallback,
      colorMode: 'to',
    });
  }
  return { datasets };
}
