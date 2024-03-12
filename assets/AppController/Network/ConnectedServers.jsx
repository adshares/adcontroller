import React, { useEffect, useMemo, useState } from 'react';
import { Chart } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import queryString from 'query-string';
import configSelectors from '../../redux/config/configSelectors';
import {
  useGetConnectedHostsQuery,
  useGetTurnoverByTypeQuery,
  useResetHostConnectionErrorMutation,
} from '../../redux/monitoring/monitoringApi';
import TableData from '../../Components/TableData/TableData';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Link,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import PaidIcon from '@mui/icons-material/Paid';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import SyncProblemOutlinedIcon from '@mui/icons-material/SyncProblemOutlined';
import PublishedWithChangesOutlinedIcon from '@mui/icons-material/PublishedWithChangesOutlined';
import commonStyles from '../../styles/commonStyles.scss';
import DateRangePicker from '../../Components/DateRangePicker/DateRangePicker';
import FormattedWalletAddress from '../../Components/FormatedWalletAddress/FormattedWalletAddress';
import Spinner from '../../Components/Spinner/Spinner';
import TypographyOverflowTooltip from '../../Components/TypographyOverflowTooltip/TypographyOverflowTooltip';
import { useCreateNotification } from '../../hooks';
import apiService from '../../utils/apiService';
import { getFlowChartData } from '../../utils/chartUtils';
import { adsToClicks, clicksToAds, filterObjectByKeys } from '../../utils/helpers';
import dayjs from 'dayjs';

const headCells = [
  {
    id: 'name',
    label: 'Name',
    cellWidth: '13rem',
    alignContent: 'left',
  },
  {
    id: 'status',
    label: 'Status',
    cellWidth: '6.5rem',
    alignContent: 'left',
  },
  {
    id: 'version',
    label: 'Version',
    cellWidth: '6.5rem',
    alignContent: 'left',
  },
  {
    id: 'url',
    label: 'URL',
    cellWidth: '10rem',
    alignContent: 'left',
  },
  {
    id: 'wallet',
    label: 'Wallet',
    cellWidth: '13rem',
    alignContent: 'left',
  },
  {
    id: 'lastSync',
    label: 'Last synchronization',
    cellWidth: '12rem',
    alignContent: 'left',
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    cellWidth: '9rem',
    alignContent: 'left',
  },
  {
    id: 'sites',
    label: 'Sites',
    cellWidth: '8rem',
    alignContent: 'left',
  },
  {
    id: 'countOfError',
    label: 'Errors',
    cellWidth: '8rem',
    alignContent: 'left',
  },
];

export default function ConnectedServers() {
  return (
    <>
      <ConnectedServersList />
      <ConnectedServersFlow sx={{ mt: 3 }} />
    </>
  );
}

const ConnectedServersList = () => {
  const { createErrorNotification, createSuccessNotification } = useCreateNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const [queryConfig, setQueryConfig] = useState({
    page: 1,
    cursor: null,
    limit: 20,
    ...filterObjectByKeys(
      queryString.parse(searchParams.toString(), {
        parseNumbers: true,
        parseBooleans: true,
      }),
      ['page', 'limit'],
    ),
  });
  const [joiningFeeSending, setJoiningFeeSending] = useState(false);
  const [joiningFeeDialogOpen, setJoiningFeeDialogOpen] = useState(false);
  const [joiningFeeDialogWalletAddress, setJoiningFeeDialogWalletAddress] = useState('');
  const joiningFeeDefaultAmount = 100;
  const [resetHostConnectionError] = useResetHostConnectionErrorMutation();
  const { data: response, isFetching, refetch } = useGetConnectedHostsQuery(queryConfig, { refetchOnMountOrArgChange: true });

  useEffect(() => {
    setSearchParams(queryString.stringify(queryConfig, { skipNull: true }));
  }, [queryConfig]);

  useEffect(() => {
    if (!response) {
      return;
    }
    if (queryConfig.page > response.meta.lastPage) {
      setQueryConfig((prevState) => ({ ...prevState, page: response.meta.lastPage }));
    }
  }, [response]);

  const rows = useMemo(() => {
    const hosts = response?.data || [];
    return hosts.map((host) => ({
      id: host.id,
      name: host.name,
      url: (
        <Link href={host.url} rel="nofollow noopener noreferrer" target="_blank">
          <TypographyOverflowTooltip variant="tableText2" color="dark.main">
            {host.url}
          </TypographyOverflowTooltip>
        </Link>
      ),
      wallet: (
        <>
          <FormattedWalletAddress wallet={host.walletAddress} sx={{ fontFamily: 'Monospace' }} />
          <Tooltip
            title={
              <React.Fragment>
                {'Paid ' + clicksToAds(host.paid) + ' ADS'}<br/>
                {'DSP requires ' + clicksToAds(host.infoJson.joiningFee) + ' ADS'}
                {host.paid >= host.infoJson.joiningFee && (<CheckIcon fontSize="inherit" color="success" />)}
                {host.paid < host.infoJson.joiningFee && (<CloseOutlinedIcon fontSize="inherit" color="error" />)}
              </React.Fragment>
            }
          >
            <IconButton sx={{ ml: 1 }} size="small" color="secondary" onClick={() => handleJoiningFeeDialogOpen(host.walletAddress)}>
              <PaidIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </>
      ),
      lastSync: (host.lastSynchronization && new Date(host.lastSynchronization).toLocaleString()) || '',
      campaigns: host.campaignCount,
      sites: host.siteCount,
      status:
        (host.status === 'operational' && (
          <Tooltip title={host.error || 'Operational'}>
            <PublishedWithChangesOutlinedIcon color="success" />
          </Tooltip>
        )) ||
        (host.status === 'excluded' && (
          <Tooltip title={host.error || 'Server is not on a whitelist'}>
            <CloseOutlinedIcon color="info" />
          </Tooltip>
        )) ||
        (host.status === 'failure' && (
          <Tooltip title={host.error || 'Failure'}>
            <CloseOutlinedIcon color="error" />
          </Tooltip>
        )) ||
        (host.status === 'unreachable' && (
          <Tooltip title={host.error || 'Server is unreachable'}>
            <SyncProblemOutlinedIcon color="warning" />
          </Tooltip>
        )) ||
        (host.status === 'initialization' && (
          <Tooltip title="Initialization in progress">
            <SyncOutlinedIcon color="secondaryAlt" />
          </Tooltip>
        )),
      version: host.infoJson?.version || 'no data',
      countOfError: (
        <Box className={`${commonStyles.flex} ${commonStyles.alignCenter} ${commonStyles.justifyFlexStart}`}>
          <Tooltip
            title={
              host.lastSynchronizationAttempt
                ? 'Last synchronization attempt: ' + new Date(host.lastSynchronizationAttempt).toLocaleString()
                : ''
            }
          >
            <Typography variant="tableText2">{host.connectionErrorCount}</Typography>
          </Tooltip>
          {Number(host.connectionErrorCount) > 0 && (
            <Tooltip title="Reset counter">
              <IconButton sx={{ ml: 2 }} size="small" color="secondary" onClick={() => onResetCounterClick(host.id)}>
                <RestartAltOutlinedIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    }));
  }, [response]);

  const onResetCounterClick = async (id) => {
    const result = await resetHostConnectionError({ id });
    if (result.data.message === 'OK') {
      refetch();
    }
  };

  const handleTableChanges = (event) => {
    setQueryConfig((prevState) => ({
      ...prevState,
      cursor: event.page === 1 ? null : response?.meta.cursor,
      page: event.page,
      limit: event.rowsPerPage,
    }));
  };

  const handleJoiningFeeDialogOpen = (walletAddress) => {
    setJoiningFeeDialogWalletAddress(walletAddress || '');
    setJoiningFeeDialogOpen(true);
  };

  const handleJoiningFeeDialogClose = () => {
    setJoiningFeeDialogOpen(false);
  };

  return (
    <Card width="full">
      <CardHeader title="Connected servers" />
      <CardContent>
        <Box className={`${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button
            onClick={() => handleJoiningFeeDialogOpen()}
            variant="contained"
            sx={{ mb: 2 }}
            startIcon={<PaidIcon />}
          >
            Send joining fee
          </Button>
        </Box>
        <TableData
          headCells={headCells} // array of objects {id, label, ...additional params}
          rows={rows} // array of objects { id: (uniq, required), key: (must be same of cell id) value }
          onTableChange={handleTableChanges}
          isDataLoading={isFetching}
          paginationParams={{
            page: (queryConfig.page > response?.meta.lastPage ? response?.meta.lastPage : response?.meta.currentPage) || queryConfig.page,
            lastPage: response?.meta.lastPage || 1,
            rowsPerPage: queryConfig.limit || 20,
            count: response?.meta.total || 0,
            showFirstButton: true,
            showLastButton: true,
          }}
        />
        <Dialog
          open={joiningFeeDialogOpen}
          onClose={handleJoiningFeeDialogClose}
          PaperProps={{
            component: 'form',
            onSubmit: (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const formJson = Object.fromEntries(formData);

              setJoiningFeeSending(true);
              apiService
                .sendJoiningFee(formJson.address, adsToClicks(+formJson.amount))
                .then(() => {
                  createSuccessNotification({ message: 'Joining fee sent' });
                  handleJoiningFeeDialogClose();
                  refetch();
                })
                .catch((err) => {
                  createErrorNotification(err);
                })
                .finally(() => setJoiningFeeSending(false));
            },
          }}
        >
          <DialogTitle>Send joining fee</DialogTitle>
          <DialogContent>
            <DialogContentText>Here you can send additional ADS to increase your reputation.</DialogContentText>
            <TextField
              required
              margin="dense"
              id="address"
              name="address"
              label="Address"
              type="text"
              fullWidth
              variant="standard"
              autoComplete="off"
              value={joiningFeeDialogWalletAddress}
            />
            <TextField
              autoFocus
              required
              margin="dense"
              id="amount"
              name="amount"
              label="Amount [ADS]"
              type="number"
              fullWidth
              variant="standard"
              autoComplete="off"
              defaultValue={joiningFeeDefaultAmount}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleJoiningFeeDialogClose}>Cancel</Button>
            <Button disabled={joiningFeeSending} type="submit">
              Send
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

const ConnectedServersFlow = (props) => {
  const adServerAddress = useSelector(configSelectors.getAppData).AdServer.WalletAddress;
  const [dateFrom, setDateFrom] = useState(dayjs().startOf('month'));
  const [dateTo, setDateTo] = useState(dayjs().endOf('day'));
  const [queryConfig, setQueryConfig] = useState(() => ({
    'filter[date][from]': dateFrom?.format(),
    'filter[date][to]': dateTo?.format(),
  }));
  const [chartData, setChartData] = useState({ datasets: [] });

  const { data: dspExpenseTurnoverResponse, isFetching: isFetchingDspExpense } = useGetTurnoverByTypeQuery(
    { ...queryConfig, type: 'DspExpense' },
    { refetchOnMountOrArgChange: true },
  );
  const { data: sspIncomeTurnoverResponse, isFetching: isFetchingSspIncome } = useGetTurnoverByTypeQuery(
    { ...queryConfig, type: 'SspIncome' },
    { refetchOnMountOrArgChange: true },
  );

  useEffect(() => {
    setQueryConfig((prevState) => ({
      ...prevState,
      'filter[date][from]': dateFrom?.format(),
      'filter[date][to]': dateTo?.format(),
    }));
  }, [dateFrom, dateTo]);

  useEffect(() => {
    const sspIncomeData = sspIncomeTurnoverResponse?.data || [];
    const dspExpenseData = dspExpenseTurnoverResponse?.data || [];
    setChartData(getFlowChartData(sspIncomeData, dspExpenseData, adServerAddress));
  }, [dspExpenseTurnoverResponse, sspIncomeTurnoverResponse]);

  return (
    <Card width="full" {...props}>
      <CardHeader title="Flow" />
      <CardContent>
        <Typography variant="body1">Sankey diagram below presents transfers between connected servers.</Typography>
        <DateRangePicker
          sx={{ mt: 2 }}
          dateFrom={dateFrom}
          dateTo={dateTo}
          disabled={isFetchingDspExpense || isFetchingSspIncome}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
        />
        {isFetchingDspExpense || isFetchingSspIncome ? (
          <Spinner />
        ) : (
          <Box sx={{ mt: 2, maxWidth: '60%', textAlign: 'center' }}>
            {chartData.datasets.length > 0 ? <Chart type={'sankey'} data={chartData} /> : <Typography variant="b800">No data</Typography>}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
