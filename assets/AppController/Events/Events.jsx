import React, { useMemo, useState } from 'react';
import { useGetEventsQuery } from '../../redux/monitoring/monitoringApi';
import TableData from '../../Components/TableData/TableData';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import commonStyles from '../../styles/commonStyles.scss';

const headCells = [
  {
    id: 'type',
    label: 'Type',
    cellWidth: '15rem',
    alignContent: 'center',
    filterableBy: ['select'],
    possibleSelectionOptions: [
      'BroadcastSent',
      'ExchangeRatesFetched',
      'FilteringUpdated',
      'HostBroadcastProcessed',
      'InventorySynchronized',
      'SiteRankUpdated',
      'TargetingUpdated',
    ],
  },
  {
    id: 'createdAt',
    label: 'Date of occurrence',
    cellWidth: '15rem',
    alignContent: 'center',
    filterableBy: ['date'],
  },
  {
    id: 'properties',
    label: 'Properties',
    cellWidth: '15rem',
    alignContent: 'left',
  },
];

export default function Events() {
  const [queryConfig, setQueryConfig] = useState({
    limit: 5,
    cursor: null,
    page: 1,
    types: null,
    from: null,
    to: null,
  });
  const { data: response, isFetching } = useGetEventsQuery(queryConfig, { refetchOnMountOrArgChange: true });

  const rows = useMemo(() => {
    const events = response?.data || [];
    return events.map((event) => ({
      id: event.id,
      type: event.type,
      createdAt: new Date(event.createdAt).toLocaleString(),
      properties: (
        <Typography component="pre" variant="body2" sx={{ backgroundColor: 'lightgrey', padding: 1, borderRadius: 1 }}>
          {JSON.stringify(event.properties, null, 2)}
        </Typography>
      ),
    }));
  }, [response]);

  const handleTableChanges = (event) => {
    const fromDate = event.filterBy.dateRange?.createdAt?.from || null;
    const toDate = event.filterBy.dateRange?.createdAt?.to || null;

    const formatDate = (date) => {
      if (!date) {
        return null;
      }
      const TZOffset = new Date().getTimezoneOffset() * 60000;
      return new Date(date.getTime() - TZOffset).toISOString().split('.')[0] + 'Z';
    };

    setQueryConfig((prevState) => ({
      ...prevState,
      cursor: response?.cursor || null,
      page: event.page,
      limit: event.rowsPerPage,
      types: event.filterBy.select?.type || null,
      from: formatDate(fromDate),
      to: formatDate(toDate),
    }));
  };

  return (
    <Card
      className={`${commonStyles.card}`}
      sx={{
        height: 'calc(100vh - 8rem)',
        maxWidth: 'calc(100vw - 21rem)',
      }}
    >
      <CardHeader title="Events" />
      <CardContent sx={{ height: 'calc(100% - 4rem)' }}>
        <TableData
          headCells={headCells}
          rows={rows}
          onTableChange={handleTableChanges}
          isDataLoading={isFetching}
          defaultSortBy="type"
          paginationParams={{ limit: queryConfig.limit, count: response?.total || 0, showFirstButton: true, showLastButton: true }}
        />
      </CardContent>
    </Card>
  );
}
