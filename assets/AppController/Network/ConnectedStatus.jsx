import React, { useMemo } from 'react';
import { Box, Card, CardContent, CardHeader, IconButton, Tooltip, Typography } from '@mui/material';
import { useGetConnectedHostsQuery } from '../../redux/monitoring/monitoringApi';
import TableData from '../../Components/TableData/TableData';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import SyncProblemOutlinedIcon from '@mui/icons-material/SyncProblemOutlined';
import PublishedWithChangesOutlinedIcon from '@mui/icons-material/PublishedWithChangesOutlined';
import commonStyles from '../../styles/commonStyles.scss';

const headCells = [
  {
    id: 'name',
    label: 'Name',
    cellWidth: '6rem',
    // pinnedToLeft: true,
    sortable: true,
    alignContent: 'left',
    filterableBy: ['text', 'range', 'select'],
  },
  {
    id: 'status',
    label: 'Status',
    cellWidth: '6rem',
    // pinnedToLeft: true,
    sortable: true,
    alignContent: 'center',
    // filterableBy: ['text', 'range', 'select'],
  },
  {
    id: 'url',
    label: 'URL',
    cellWidth: '6rem',
    // pinnedToLeft: true,
    sortable: true,
    alignContent: 'left',
    // filterableBy: ['text', 'range', 'select'],
  },
  {
    id: 'wallet',
    label: 'Wallet',
    cellWidth: '10rem',
    // pinnedToLeft: true,
    sortable: true,
    alignContent: 'left',
    // filterableBy: ['text', 'range', 'select'],
  },
  {
    id: 'lastSync',
    label: 'Last synchronization',
    cellWidth: '6rem',
    // pinnedToLeft: true,
    sortable: true,
    alignContent: 'center',
    // filterableBy: ['text', 'range', 'select'],
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    cellWidth: '6rem',
    // pinnedToLeft: true,
    sortable: true,
    alignContent: 'center',
    // filterableBy: ['text', 'range', 'select'],
  },
  {
    id: 'sites',
    label: 'Sites',
    cellWidth: '6rem',
    // pinnedToLeft: true,
    sortable: true,
    alignContent: 'center',
    // filterableBy: ['text', 'range', 'select'],
  },
  {
    id: 'countOfError',
    label: 'Count of connection error',
    cellWidth: '6rem',
    // pinnedToLeft: true,
    sortable: true,
    alignContent: 'center',
    // filterableBy: ['text', 'range', 'select'],
  },
];

export default function ConnectedStatus() {
  const { data: response, isFetching } = useGetConnectedHostsQuery();
  console.log(response);

  const handleTableChanges = (event) => {
    console.log(event);
  };

  const rows = useMemo(() => {
    const hosts = response?.data?.hosts || [];
    return hosts.map((host) => ({
      id: host.id,
      name: host.name,
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
      url: host.url,
      wallet: host.walletAddress,
      lastSync: (host.lastSynchronization && new Date(host.lastSynchronization).toLocaleString()) || '',
      campaigns: host.campaignCount,
      sites: host.siteCount,
      countOfError: (
        <Box className={`${commonStyles.flex} ${commonStyles.alignCenter} ${commonStyles.justifyCenter}`}>
          <Typography variant="body2">{host.connectionErrorCount}</Typography>
          {Number(host.connectionErrorCount) > 0 && (
            <Tooltip title="Reset counter">
              <IconButton size="small" color="primary">
                <RestartAltOutlinedIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    }));
  }, [response]);

  console.log(rows);

  return (
    <Card
      className={`${commonStyles.card}`}
      sx={{
        maxHeight: 'calc(100vh - 8rem)',
        maxWidth: 'calc(100vw - 21rem)',
      }}
    >
      <CardHeader title="Connected status" />
      <CardContent sx={{ height: 'calc(100% - 4rem)' }}>
        <TableData
          headCells={headCells} // array of objects {id, label, ...additional params}
          rows={rows} // array of objects { id: (uniq, required), key: (must be same of cell id) value }
          onTableChange={handleTableChanges}
          isDataLoading={isFetching}
          defaultSortBy="name" //(must be same of cell id)
        />
      </CardContent>
    </Card>
  );
}
