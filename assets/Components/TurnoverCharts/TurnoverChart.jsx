import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { useGetTurnoverChartQuery } from '../../redux/monitoring/monitoringApi';
import Spinner from '../Spinner/Spinner';

function getChartOptions(title) {
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

function getChartResolutionByDaysSpan(daysSpan) {
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

function extractDatasetsFromResponseData(responseData, fields) {
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

function extractLabelsFromResponseData(responseData, chartResolution) {
  const formatDate = getDateLabelFormatter(chartResolution);

  const labels = [];
  for (const entry of responseData) {
    labels.push(formatDate(entry.date));
  }

  return labels;
}

function getChartDataInitialState() {
  return {
    labels: [],
    datasets: [
      {
        label: 'Advertisers Expense',
        data: [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        hidden: true,
      },
      {
        label: 'License Fee',
        data: [],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        hidden: true,
      },
      {
        label: 'Operator Fee',
        data: [],
        borderColor: 'rgb(255, 205, 86)',
        backgroundColor: 'rgb(255, 205, 86, 0.5)',
      },
      {
        label: 'Community Fee',
        data: [],
        borderColor: 'rgb(240, 60, 240)',
        backgroundColor: 'rgba(240, 60, 240, 0.5)',
        hidden: true,
      },
      {
        label: 'DSP Expense',
        data: [],
        borderColor: 'rgb(53, 162, 50)',
        backgroundColor: 'rgba(53, 162, 50, 0.5)',
        hidden: true,
      },
      {
        label: 'SSP Income',
        data: [],
        borderColor: 'rgb(98, 66, 145)',
        backgroundColor: 'rgba(98, 66, 145, 0.5)',
        hidden: true,
      },
      {
        label: 'Publishers Income',
        data: [],
        borderColor: 'rgb(136, 227, 170)',
        backgroundColor: 'rgba(136, 227, 170, 0.5)',
        hidden: true,
      },
    ],
  };
}

export default function TurnoverChart({ dateFrom, dateTo, props }) {
  const chartOptions = getChartOptions();
  const [chartResolution, setChartResolution] = useState('day');
  const [queryConfig, setQueryConfig] = useState(() => ({
    chartResolution,
    'filter[date][from]': dateFrom?.format(),
    'filter[date][to]': dateTo?.format(),
  }));
  const [chart, setChartData] = useState(() => getChartDataInitialState());
  const { data: turnoverChartResponse, isFetching: isFetchingChart } = useGetTurnoverChartQuery(queryConfig, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    const daysSpan = dateTo.diff(dateFrom, 'day');
    const resolution = getChartResolutionByDaysSpan(daysSpan);
    setChartResolution(resolution);
    setQueryConfig((prevState) => ({
      ...prevState,
      chartResolution: resolution,
      'filter[date][from]': dateFrom?.format(),
      'filter[date][to]': dateTo?.format(),
    }));
  }, [dateFrom, dateTo]);

  useEffect(() => {
    if (!turnoverChartResponse?.data) {
      return;
    }

    const labels = extractLabelsFromResponseData(turnoverChartResponse.data, chartResolution);
    const datasets = extractDatasetsFromResponseData(turnoverChartResponse.data, [
      'dspAdvertisersExpense',
      'dspLicenseFee',
      'dspOperatorFee',
      'dspCommunityFee',
      'dspExpense',
      'sspIncome',
      'sspLicenseFee',
      'sspOperatorFee',
      'sspPublishersIncome',
    ]);

    setChartData(() => ({
      ...chart,
      labels,
      datasets: [
        // dspAdvertisersExpense
        { ...chart.datasets[0], data: datasets[0] },
        // dspLicenseFee + sspLicenseFee
        { ...chart.datasets[1], data: datasets[1].map((num, idx) => num + datasets[6][idx]) },
        // dspOperatorFee + sspOperatorFee
        { ...chart.datasets[2], data: datasets[2].map((num, idx) => num + datasets[7][idx]) },
        // dspCommunityFee
        { ...chart.datasets[3], data: datasets[3] },
        // dspExpense
        { ...chart.datasets[4], data: datasets[4] },
        // sspIncome
        { ...chart.datasets[5], data: datasets[5] },
        // sspPublishersIncome
        { ...chart.datasets[6], data: datasets[8] },
      ],
    }));
  }, [turnoverChartResponse]);

  return (
    <Box {...props}>{isFetchingChart ? <Spinner /> : <>{chart.labels.length > 0 && <Line options={chartOptions} data={chart} />}</>}</Box>
  );
}
