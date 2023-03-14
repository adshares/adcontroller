import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import queryString from 'query-string';
import { useGetConnectedHostsQuery, useResetHostConnectionErrorMutation } from '../../redux/monitoring/monitoringApi';
import TableData from '../../Components/TableData/TableData';
import { Box, Card, CardContent, CardHeader, IconButton, Link, Tooltip, Typography } from '@mui/material';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import SyncProblemOutlinedIcon from '@mui/icons-material/SyncProblemOutlined';
import PublishedWithChangesOutlinedIcon from '@mui/icons-material/PublishedWithChangesOutlined';
import commonStyles from '../../styles/commonStyles.scss';
import FormattedWalletAddress from '../../Components/FormatedWalletAddress/FormattedWalletAddress';
import TypographyOverflowTooltip from '../../Components/TypographyOverflowTooltip/TypographyOverflowTooltip';
import { filterObjectByKeys } from '../../utils/helpers';

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
        <Link href={host.url} target="_blank">
          <TypographyOverflowTooltip variant="tableText2" color="black.main">
            {host.url}
          </TypographyOverflowTooltip>
        </Link>
      ),
      wallet: <FormattedWalletAddress wallet={host.walletAddress} />,
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
            <SyncOutlinedIcon color="info" />
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

  return (
    <Card width="full">
      <CardHeader title="Connected servers" />
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
