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

export default function TurnoverCharts({ dateFrom, dateTo, props }) {
  const dspChartOptions = getChartOptions('DSP Turnover');
  const sspChartOptions = getChartOptions('SSP Turnover');
  const [chartResolution, setChartResolution] = useState('day');
  const [queryConfig, setQueryConfig] = useState(() => ({
    chartResolution,
    'filter[date][from]': dateFrom?.format(),
    'filter[date][to]': dateTo?.format(),
  }));
  const [dspChart, setDspChart] = useState(() => ({
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
        label: 'Expense',
        data: [],
        borderColor: 'rgb(53, 162, 50)',
        backgroundColor: 'rgba(53, 162, 50, 0.5)',
        hidden: true,
      },
    ],
  }));
  const [sspChart, setSspChart] = useState(() => ({
    labels: [],
    datasets: [
      {
        label: 'Income',
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
        label: 'Publishers Income',
        data: [],
        borderColor: 'rgb(53, 162, 50)',
        backgroundColor: 'rgba(53, 162, 50, 0.5)',
        hidden: true,
      },
    ],
  }));
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
    const dspDatasets = extractDatasetsFromResponseData(turnoverChartResponse.data, [
      'dspAdvertisersExpense',
      'dspLicenseFee',
      'dspOperatorFee',
      'dspCommunityFee',
      'dspExpense',
    ]);
    const sspDatasets = extractDatasetsFromResponseData(turnoverChartResponse.data, [
      'sspIncome',
      'sspLicenseFee',
      'sspOperatorFee',
      'sspPublishersIncome',
    ]);

    setDspChart(() => ({
      ...dspChart,
      labels,
      datasets: [
        { ...dspChart.datasets[0], data: dspDatasets[0] },
        { ...dspChart.datasets[1], data: dspDatasets[1] },
        { ...dspChart.datasets[2], data: dspDatasets[2] },
        { ...dspChart.datasets[3], data: dspDatasets[3] },
        { ...dspChart.datasets[4], data: dspDatasets[4] },
      ],
    }));
    setSspChart(() => ({
      ...sspChart,
      labels,
      datasets: [
        { ...sspChart.datasets[0], data: sspDatasets[0] },
        { ...sspChart.datasets[1], data: sspDatasets[1] },
        { ...sspChart.datasets[2], data: sspDatasets[2] },
        { ...sspChart.datasets[3], data: sspDatasets[3] },
      ],
    }));
  }, [turnoverChartResponse]);

  return (
    <Box {...props}>
      {isFetchingChart ? (
        <Spinner />
      ) : (
        <>
          {dspChart.labels.length > 0 && <Line options={dspChartOptions} data={dspChart} />}
          {sspChart.labels.length > 0 && <Line options={sspChartOptions} data={sspChart} />}
        </>
      )}
    </Box>
  );
}
