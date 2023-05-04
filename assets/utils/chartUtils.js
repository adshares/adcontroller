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

export function getChartResolutionByDaysSpan(daysSpan) {
  if (daysSpan <= 2) {
    return 'hour';
  } else if (daysSpan <= 31) {
    return 'day';
  } else if (daysSpan <= 182) {
    return 'week';
  } else {
    return 'month';
  }
}

function getDateLabelFormatter(chartResolution) {
  if ('hour' === chartResolution) {
    return function (date) {
      return `${date.substring(0, 10)} ${date.substring(11, 16)}`;
    };
  }

  if ('day' === chartResolution || 'week' === chartResolution) {
    return function (date) {
      return date.substring(0, 10);
    };
  }

  return function (date) {
    return date.substring(0, 7);
  };
}

export function extractDatasetsFromResponseData(responseData, fields) {
  const fieldsCount = fields.length;

  const datasets = [];
  for (let i = 0; i < fieldsCount; i++) {
    datasets.push([]);
  }

  for (const entry of responseData) {
    for (let i = 0; i < fieldsCount; i++) {
      datasets[i].push(entry[fields[i]] / 1e11);
    }
  }

  return datasets;
}

export function extractLabelsFromResponseData(responseData, chartResolution) {
  const formatDate = getDateLabelFormatter(chartResolution);

  const labels = [];
  for (const entry of responseData) {
    labels.push(formatDate(entry.date));
  }

  return labels;
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
