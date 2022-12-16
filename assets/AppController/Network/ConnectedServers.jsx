import React, { useMemo, useState } from 'react';
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
    cellWidth: '6rem',
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
  const [queryConfig, setQueryConfig] = useState({
    page: 1,
    cursor: null,
    limit: 20,
  });
  const [resetHostConnectionError] = useResetHostConnectionErrorMutation();
  const { data: response, isFetching, refetch } = useGetConnectedHostsQuery(queryConfig, { refetchOnMountOrArgChange: true });

  const rows = useMemo(() => {
    const hosts = response?.data || [];
    return hosts.map((host) => ({
      id: host.id,
      name: host.name,
      url: (
        <Link href={host.url} target="_blank">
          <Typography variant="tableText2" sx={{ overflowWrap: 'anywhere' }} color="black.main">
            {host.url}
          </Typography>
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
      countOfError: (
        <Box className={`${commonStyles.flex} ${commonStyles.alignCenter} ${commonStyles.justifyFlexStart}`}>
          <Typography variant="body2">{host.connectionErrorCount}</Typography>
          {Number(host.connectionErrorCount) > 0 && (
            <Tooltip title="Reset counter">
              <IconButton sx={{ ml: 2 }} size="small" color="secondary" onClick={() => onResetCounterClick(host.id)}>
                <RestartAltOutlinedIcon />
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
      cursor: response?.cursor || null,
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
          defaultSortBy="name" //(must be same of cell id)
          paginationParams={{
            limit: queryConfig.limit,
            count: response?.total || 0,
            showFirstButton: true,
            showLastButton: true,
          }}
        />
      </CardContent>
    </Card>
  );
}
