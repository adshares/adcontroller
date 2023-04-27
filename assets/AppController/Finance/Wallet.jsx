import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import configSelectors from '../../redux/config/configSelectors';
import monitoringSelectors from '../../redux/monitoring/monitoringSelectors';
import { useSetWalletConfigMutation, useSetColdWalletConfigMutation, useGetWalletNodeMutation } from '../../redux/config/configApi';
import { useGetTurnoverQuery, useGetTurnoverChartQuery, useGetWalletMonitoringQuery } from '../../redux/monitoring/monitoringApi';
import { changeColdWalletConfigInformation, changeWalletConfigInformation } from '../../redux/config/configSlice';
import { useForm, useSkipFirstRenderEffect, useCreateNotification } from '../../hooks';
import { adsToClicks, clicksToAds, formatMoney, returnNumber } from '../../utils/helpers';
import { validateAddress } from '@adshares/ads';
import FormattedWalletAddress from '../../Components/FormatedWalletAddress/FormattedWalletAddress';
import Spinner from '../../Components/Spinner/Spinner';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Collapse,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import commonStyles from '../../styles/commonStyles.scss';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartJsTooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartJsTooltip, Legend);

export default function Wallet() {
  return (
    <>
      <WalletStatusCard />
      <WalletSettingsCard sx={{ mt: 3 }} />
      <ColdWalletSettingsCard sx={{ mt: 3 }} />
    </>
  );
}

const WalletSettingsCard = (props) => {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const [getWalletNode, { isFetching: isNodeVerification }] = useGetWalletNodeMutation();
  const [editMode, setEditMode] = useState(false);
  const [isKnownNode, setKnownNode] = useState(false);
  const { createSuccessNotification } = useCreateNotification();
  const walletForm = useForm({
    initialFields: { WalletAddress: '', WalletSecretKey: '' },
    validation: {
      WalletAddress: ['required', 'ADSWallet'],
      WalletSecretKey: ['required', 'walletSecret'],
    },
  });
  const nodeForm = useForm({
    initialFields: { WalletNodeHost: '', WalletNodePort: '' },
    validation: {
      WalletNodeHost: ['required', 'domain'],
      WalletNodePort: ['required', 'integer'],
    },
  });
  const [setWalletConfig, { isLoading }] = useSetWalletConfigMutation();

  useSkipFirstRenderEffect(() => {
    if (walletForm.errorObj.WalletAddress.isValid) {
      getWalletNodes();
    }
  }, [walletForm.fields.WalletAddress]);

  useEffect(() => {
    checkIsKnownNode(walletForm.fields.WalletAddress);
  }, [walletForm.fields.WalletAddress]);

  const getWalletNodes = async () => {
    const response = await getWalletNode({ WalletAddress: walletForm.fields.WalletAddress });
    if (response.data) {
      nodeForm.setFields({ ...response.data });
    }
    if (response.error) {
      nodeForm.setFields({
        WalletNodeHost: '',
        WalletNodePort: '',
      });
    }
  };

  const checkIsKnownNode = (walletAddress) => {
    const isValidWalletAddress = validateAddress(walletAddress);
    if (!isValidWalletAddress) {
      return;
    }
    const expression = walletAddress.slice(0, 4);
    if (parseInt(expression, 16) > 0 && parseInt(expression, 16) <= 34) {
      setKnownNode(true);
      return;
    }
    setKnownNode(false);
  };

  const onSaveClick = async () => {
    const response = await setWalletConfig({ ...walletForm.fields, ...nodeForm.fields });

    if (response.data && response.data.message === 'OK') {
      dispatch(changeWalletConfigInformation(response.data.data));
      setEditMode((prevState) => !prevState);
      walletForm.resetForm();
      nodeForm.resetForm();
      createSuccessNotification();
    }
  };

  const toggleEditMode = () => {
    if (editMode) {
      walletForm.resetForm();
      nodeForm.resetForm();
    }
    setEditMode(!editMode);
  };

  return (
    <Card {...props}>
      <Box className={`${commonStyles.flex} ${commonStyles.justifySpaceBetween} ${commonStyles.alignBaseline}`}>
        <CardHeader title="Hot wallet" />
        <IconButton type="button" onClick={toggleEditMode}>
          {editMode ? <CloseIcon color="error" /> : <EditIcon color="primary" />}
        </IconButton>
      </Box>
      <CardContent>
        <>
          <Collapse in={!editMode} timeout="auto">
            <Typography variant="h3">
              Wallet address: <FormattedWalletAddress wallet={appData.AdServer.WalletAddress} variant="b800" />
            </Typography>
          </Collapse>
          <Collapse in={editMode} timeout="auto" unmountOnExit>
            <Box component="form" onChange={walletForm.onChange} onFocus={walletForm.setTouched}>
              <TextField
                fullWidth
                customvariant="highLabel"
                name="WalletAddress"
                label="Wallet address"
                error={walletForm.touchedFields.WalletAddress && !walletForm.errorObj.WalletAddress.isValid}
                helperText={walletForm.touchedFields.WalletAddress && walletForm.errorObj.WalletAddress.helperText}
                value={walletForm.fields.WalletAddress}
                type="text"
                inputProps={{ autoComplete: 'off' }}
              />

              <TextField
                fullWidth
                customvariant="highLabel"
                name="WalletSecretKey"
                label="Secret key"
                error={walletForm.touchedFields.WalletSecretKey && !walletForm.errorObj.WalletSecretKey.isValid}
                helperText={walletForm.touchedFields.WalletSecretKey && walletForm.errorObj.WalletSecretKey.helperText}
                value={walletForm.fields.WalletSecretKey}
                type="text"
                inputProps={{ autoComplete: 'off' }}
              />
            </Box>
            <Collapse
              in={Object.values(nodeForm.fields).some((el) => !!el) && !isKnownNode && walletForm.errorObj.WalletAddress.isValid}
              timeout="auto"
              unmountOnExit
            >
              {isNodeVerification ? (
                <Spinner />
              ) : (
                <Box component="form" onChange={nodeForm.onChange} onFocus={nodeForm.setTouched}>
                  <TextField
                    fullWidth
                    customvariant="highLabel"
                    name="WalletNodeHost"
                    label="Node host"
                    error={nodeForm.touchedFields.WalletNodeHost && !nodeForm.errorObj.WalletNodeHost.isValid}
                    helperText={nodeForm.touchedFields.WalletNodeHost && nodeForm.errorObj.WalletNodeHost.helperText}
                    value={nodeForm.fields.WalletNodeHost}
                    type="text"
                    inputProps={{ autoComplete: 'off' }}
                  />

                  <TextField
                    fullWidth
                    customvariant="highLabel"
                    name="WalletNodePort"
                    label="Node port"
                    error={nodeForm.touchedFields.WalletNodePort && !nodeForm.errorObj.WalletNodePort.isValid}
                    helperText={nodeForm.touchedFields.WalletNodePort && nodeForm.errorObj.WalletNodePort.helperText}
                    value={nodeForm.fields.WalletNodePort}
                    type="text"
                    inputProps={{ autoComplete: 'off' }}
                  />
                </Box>
              )}
            </Collapse>
            <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
              <Button
                onClick={onSaveClick}
                disabled={isLoading || !walletForm.isFormValid || !nodeForm.isFormValid || isNodeVerification}
                variant="contained"
                type="button"
              >
                Save
              </Button>
            </Box>
          </Collapse>
        </>
      </CardContent>
    </Card>
  );
};

const WalletStatusCard = (props) => {
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
  const dspChartOptions = getChartOptions('DSP Turnover');
  const sspChartOptions = getChartOptions('SSP Turnover');

  const [dateFrom, setDateFrom] = useState(dayjs().startOf('month'));
  const [dateTo, setDateTo] = useState(dayjs().endOf('day'));
  const [dataRangeOption, setDataRangeOption] = useState('0');
  const [chartResolution, setChartResolution] = useState('day');
  const [queryConfig, setQueryConfig] = useState(() => ({
    chartResolution,
    'filter[date][from]': dateFrom?.format(),
    'filter[date][to]': dateTo?.format(),
  }));
  const [dspRows, setDspRows] = useState(() => []);
  const [sspRows, setSspRows] = useState(() => []);
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
        borderColor: 'rgb(240, 60, 240)',
        backgroundColor: 'rgba(240, 60, 240, 0.5)',
      },
      {
        label: 'Community Fee',
        data: [],
        borderColor: 'rgb(230, 230, 50)',
        backgroundColor: 'rgba(230, 230, 50, 0.5)',
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
        borderColor: 'rgb(240, 60, 240)',
        backgroundColor: 'rgba(240, 60, 240, 0.5)',
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

  const { data: turnoverResponse, isFetching } = useGetTurnoverQuery(queryConfig, { refetchOnMountOrArgChange: true });
  const { data: turnoverChartResponse, isFetchingChart } = useGetTurnoverChartQuery(queryConfig, { refetchOnMountOrArgChange: true });

  useEffect(() => {
    const daysSpan = dateTo.diff(dateFrom, 'day');
    let resolution = 'day';
    if (daysSpan <= 2) {
      resolution = 'hour';
    } else if (daysSpan <= 31) {
      resolution = 'day';
    } else if (daysSpan <= 182) {
      resolution = 'week';
    } else {
      resolution = 'month';
    }
    setChartResolution(resolution);
    setQueryConfig((prevState) => ({
      ...prevState,
      chartResolution: resolution,
      'filter[date][from]': dateFrom?.format(),
      'filter[date][to]': dateTo?.format(),
    }));
  }, [dateFrom, dateTo]);

  useEffect(() => {
    if (!turnoverResponse?.data) {
      return;
    }
    setDspRows(() => [
      { name: 'dspAdvertisersExpense', description: 'Advertisers expense', amount: turnoverResponse.data.dspAdvertisersExpense },
      { name: 'dspLicenseFee', description: 'License fee', amount: turnoverResponse.data.dspLicenseFee },
      { name: 'dspOperatorFee', description: 'Operator fee', amount: turnoverResponse.data.dspOperatorFee },
      { name: 'dspCommunityFee', description: 'Community fee', amount: turnoverResponse.data.dspCommunityFee },
      { name: 'dspExpense', description: 'Expense', amount: turnoverResponse.data.dspExpense },
    ]);
    setSspRows(() => [
      { name: 'sspIncome', description: 'Income', amount: turnoverResponse.data.sspIncome },
      { name: 'sspLicenseFee', description: 'License fee', amount: turnoverResponse.data.sspLicenseFee },
      { name: 'sspOperatorFee', description: 'Operator fee', amount: turnoverResponse.data.sspOperatorFee },
      { name: 'sspPublishersIncome', description: 'Publishers income', amount: turnoverResponse.data.sspPublishersIncome },
    ]);
  }, [turnoverResponse]);

  function getDateLabelFormatter() {
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

  function extractDataFromResponse(fields) {
    const fieldsCount = fields.length;
    const labels = [];
    const datasets = [];
    const formatDate = getDateLabelFormatter();
    for (let i = 0; i < fieldsCount; i++) {
      datasets.push([]);
    }

    for (const entry of turnoverChartResponse.data) {
      labels.push(formatDate(entry.date));
      for (let i = 0; i < fieldsCount; i++) {
        datasets[i].push(entry[fields[i]] / 1e11);
      }
    }

    return { labels, datasets };
  }

  useEffect(() => {
    if (!turnoverChartResponse?.data) {
      return;
    }

    const { labels: dspLabels, datasets: dspDatasets } = extractDataFromResponse([
      'dspAdvertisersExpense',
      'dspLicenseFee',
      'dspOperatorFee',
      'dspCommunityFee',
      'dspExpense',
    ]);
    const { labels: sspLabels, datasets: sspDatasets } = extractDataFromResponse([
      'sspIncome',
      'sspLicenseFee',
      'sspOperatorFee',
      'sspPublishersIncome',
    ]);

    setDspChart(() => ({
      ...dspChart,
      labels: dspLabels,
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
      labels: sspLabels,
      datasets: [
        { ...sspChart.datasets[0], data: sspDatasets[0] },
        { ...sspChart.datasets[1], data: sspDatasets[1] },
        { ...sspChart.datasets[2], data: sspDatasets[2] },
        { ...sspChart.datasets[3], data: sspDatasets[3] },
      ],
    }));
  }, [turnoverChartResponse]);

  const monitoringWalletInfo = useSelector(monitoringSelectors.getMonitoringWalletInfo);
  useGetWalletMonitoringQuery([], {
    pollingInterval: 3000,
  });

  const dateRangeOptions = [
    { value: '0', label: 'This month' },
    { value: '1', label: 'This year' },
    { value: '2', label: 'Previous month' },
    { value: '3', label: 'Previous year' },
    { value: '4', label: 'Last month' },
    { value: '5', label: 'Last year' },
    { value: '6', label: 'Custom' },
  ];

  const handleDateRangeChange = (event) => {
    if ('0' === event.target.value) {
      setDateFrom(dayjs().startOf('month'));
      setDateTo(dayjs().endOf('day'));
    } else if ('1' === event.target.value) {
      setDateFrom(dayjs().startOf('year'));
      setDateTo(dayjs().endOf('day'));
    } else if ('2' === event.target.value) {
      const startOfMonth = dayjs().startOf('month');
      setDateFrom(startOfMonth.subtract(1, 'month'));
      setDateTo(startOfMonth.subtract(1, 'second'));
    } else if ('3' === event.target.value) {
      const startOfYear = dayjs().startOf('year');
      setDateFrom(startOfYear.subtract(1, 'year'));
      setDateTo(startOfYear.subtract(1, 'second'));
    } else if ('4' === event.target.value) {
      setDateFrom(dayjs().subtract(1, 'month').startOf('day'));
      setDateTo(dayjs().endOf('day'));
    } else if ('5' === event.target.value) {
      setDateFrom(dayjs().subtract(1, 'year').startOf('day'));
      setDateTo(dayjs().endOf('day'));
    }
    setDataRangeOption(event.target.value);
  };
  return (
    <Card {...props}>
      <CardHeader title="Ad server balance" />
      <CardContent>
        <Typography variant="h3">
          Total balance: <Typography variant="b800">{formatMoney(monitoringWalletInfo.balance, 5)} ADS</Typography>
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          {/* eslint-disable-next-line max-len */}
          Total balance of all user accounts. This amount should be at least equal to the sum of funds accumulated in hot and cold wallets.{' '}
          <Typography variant="b600">The amount exceeding this value is the operator's profit</Typography>.
        </Typography>
      </CardContent>
      <CardContent sx={{ mt: 6.5 }}>
        <Typography variant="h3">
          Unused bonuses: <Typography variant="b800">{formatMoney(monitoringWalletInfo.unusedBonuses, 5)} ADS</Typography>
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          The total amount of all bonuses that have been added to user accounts but have not yet been used up.
        </Typography>
      </CardContent>
      <CardContent>
        <Typography variant="h3">Turnover</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Cash flows by category. Money flow is explained in{' '}
          <Link href={'https://docs.adshares.net/protocol/payments/index.html'} rel="nofollow noopener noreferrer" target="_blank">
            the docs
          </Link>
          .
        </Typography>
        <Box sx={{ mt: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="From"
              value={dateFrom}
              onChange={(newValue) => {
                setDateFrom(newValue);
                setDataRangeOption('6');
              }}
              disabled={isFetching}
              minDate={dayjs().subtract(2, 'year')}
              maxDate={dateTo}
              disableFuture={true}
              sx={{ mr: 2 }}
            />
            <DatePicker
              label="To"
              value={dateTo}
              onChange={(newValue) => {
                setDateTo(newValue);
                setDataRangeOption('6');
              }}
              disabled={isFetching}
              maxDate={dayjs().endOf('day')}
              sx={{ mr: 2 }}
            />
            <FormControl sx={{ minWidth: '165px' }}>
              <InputLabel id="date-range-select-label">Date range</InputLabel>
              <Select
                labelId="date-range-select-label"
                id="date-range-select"
                value={dataRangeOption}
                label="Date range"
                onChange={handleDateRangeChange}
              >
                {dateRangeOptions.map((option) => (
                  <MenuItem value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </LocalizationProvider>
        </Box>
        {!isFetching && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <TableContainer sx={{ maxWidth: 600 }}>
                <Table aria-label="Turnover data table">
                  <TableHead>
                    <TableRow>
                      <TableCell>DSP</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dspRows.map((row) => (
                      <TableRow key={row.name}>
                        <TableCell component="th" scope="row">
                          {row.description}
                        </TableCell>
                        <TableCell align="right">{formatMoney(row.amount, 5)} ADS</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={6}>
              <TableContainer sx={{ maxWidth: 600 }}>
                <Table aria-label="Turnover data table">
                  <TableHead>
                    <TableRow>
                      <TableCell>SSP</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sspRows.map((row) => (
                      <TableRow key={row.name}>
                        <TableCell component="th" scope="row">
                          {row.description}
                        </TableCell>
                        <TableCell align="right">{formatMoney(row.amount, 5)} ADS</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        )}
        {!isFetchingChart && dspChart.labels.length > 0 && <Line options={dspChartOptions} data={dspChart} />}
        {!isFetchingChart && sspChart.labels.length > 0 && <Line options={sspChartOptions} data={sspChart} />}
      </CardContent>
    </Card>
  );
};

const ColdWalletSettingsCard = (props) => {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const [setColdWalletConfig, { isLoading }] = useSetColdWalletConfigMutation();
  const { createSuccessNotification } = useCreateNotification();
  const [ColdWalletIsActive, setColdWalletIsActive] = useState(appData.AdServer.ColdWalletIsActive || false);
  const form = useForm({
    initialFields: {
      HotWalletMinValue: clicksToAds(appData.AdServer.HotWalletMinValue),
      HotWalletMaxValue: clicksToAds(appData.AdServer.HotWalletMaxValue),
      ColdWalletAddress: appData.AdServer.ColdWalletAddress,
    },
    validation: {
      ColdWalletAddress: ['required', 'ADSWallet'],
      HotWalletMinValue: ['number'],
      HotWalletMaxValue: ['number'],
    },
  });

  const onSaveClick = async () => {
    const body = ColdWalletIsActive
      ? {
          ColdWalletIsActive,
          HotWalletMinValue: adsToClicks(returnNumber(form.fields.HotWalletMinValue)),
          HotWalletMaxValue: adsToClicks(returnNumber(form.fields.HotWalletMaxValue)),
          ColdWalletAddress: form.fields.ColdWalletAddress,
        }
      : { ColdWalletIsActive };

    const response = await setColdWalletConfig(body);

    if (response.data && response.data.message === 'OK') {
      dispatch(changeColdWalletConfigInformation(response.data.data));
      createSuccessNotification();
    }
  };

  return (
    <Card {...props}>
      <CardHeader title="Cold wallet" />

      <CardContent>
        <FormControlLabel
          label="Enable cold wallet"
          control={<Checkbox checked={ColdWalletIsActive} onChange={() => setColdWalletIsActive((prevState) => !prevState)} />}
        />
        <Collapse in={ColdWalletIsActive} timeout="auto">
          <Box component="form" onChange={form.onChange} onFocus={form.setTouched}>
            <Box className={`${commonStyles.flex} ${commonStyles.alignBaseline}`}>
              <TextField
                sx={{ mb: 3 }}
                fullWidth
                customvariant="highLabel"
                name="HotWalletMinValue"
                label="Min threshold value"
                error={form.touchedFields.HotWalletMinValue && !form.errorObj.HotWalletMinValue.isValid}
                helperText={form.touchedFields.HotWalletMinValue && form.errorObj.HotWalletMinValue.helperText}
                value={form.fields.HotWalletMinValue}
                type="number"
                inputProps={{ autoComplete: 'off', min: 0 }}
              />
              <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
                <Typography sx={{ ml: 2, fontSize: '24px' }} variant="b800">
                  ADS
                </Typography>
                <Tooltip
                  sx={{ ml: 2 }}
                  title={
                    // eslint-disable-next-line max-len
                    'Set a minimum amount required to run operations. In case the amount drops below the specified threshold, you will be notified via e-mail.'
                  }
                >
                  <InfoIcon color="secondary" />
                </Tooltip>
              </Box>
            </Box>

            <Box className={`${commonStyles.flex} ${commonStyles.alignBaseline}`}>
              <TextField
                sx={{ mb: 3 }}
                fullWidth
                customvariant="highLabel"
                name="HotWalletMaxValue"
                label="Max threshold value"
                error={form.touchedFields.HotWalletMaxValue && !form.errorObj.HotWalletMaxValue.isValid}
                helperText={form.touchedFields.HotWalletMaxValue && form.errorObj.HotWalletMaxValue.helperText}
                value={form.fields.HotWalletMaxValue}
                type="number"
                inputProps={{ autoComplete: 'off', min: 0 }}
              />
              <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
                <Typography sx={{ ml: 2, fontSize: '24px' }} variant="b800">
                  ADS
                </Typography>
                <Tooltip
                  sx={{ ml: 2 }}
                  title={
                    // eslint-disable-next-line max-len
                    'Set a maximum amount that can be stored on a hot wallet. All funds exceeding this amount will be automatically transferred to your cold wallet.'
                  }
                >
                  <InfoIcon color="secondary" />
                </Tooltip>
              </Box>
            </Box>

            <TextField
              fullWidth
              customvariant="highLabel"
              name="ColdWalletAddress"
              label="Cold wallet address"
              error={form.touchedFields.ColdWalletAddress && !form.errorObj.ColdWalletAddress.isValid}
              helperText={form.touchedFields.ColdWalletAddress && form.errorObj.ColdWalletAddress.helperText}
              value={form.fields.ColdWalletAddress}
              type="text"
              inputProps={{ autoComplete: 'off' }}
            />
          </Box>
        </Collapse>
      </CardContent>
      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button
            disabled={
              (appData.AdServer.ColdWalletIsActive === ColdWalletIsActive && !form.isFormWasChanged) || isLoading || !form.isFormValid
            }
            onClick={onSaveClick}
            variant="contained"
            type="button"
          >
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};
