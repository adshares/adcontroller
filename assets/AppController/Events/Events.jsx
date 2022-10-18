import React, { useMemo, useState } from 'react';
import { useGetEventsQuery } from '../../redux/monitoring/monitoringApi';
import TableData from '../../Components/TableData/TableData';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import commonStyles from '../../styles/commonStyles.scss';

const headCells = [
  {
    id: 'type',
    label: 'Type',
    cellWidth: '10rem',
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
    cellWidth: '10rem',
    alignContent: 'center',
  },
  {
    id: 'properties',
    label: 'Properties',
    cellWidth: '10rem',
    alignContent: 'left',
  },
];

export default function Events() {
  const [currentPage, setCurrentPage] = useState(0);
  const [limit, setLimit] = useState(5);
  const [cursor, setCursor] = useState(null);
  const [typeQueryParams, setTypeQueryParams] = useState([]);
  const { data: response, isFetching } = useGetEventsQuery({ limit, cursor, typeQueryParams }, { refetchOnMountOrArgChange: true });

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
    if (event.page > currentPage) {
      setCursor(response.nextCursor);
      setCurrentPage(event.page);
    }
    if (event.page < currentPage) {
      setCursor(response.prevCursor);
      setCurrentPage(event.page);
    }
    if (limit !== event.rowsPerPage) {
      setCursor(null);
    }
    setTypeQueryParams(event.filterBy.select?.type || []);
    setLimit(event.rowsPerPage);
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
          paginationParams={{ limit, count: response?.total || 0 }}
        />
      </CardContent>
    </Card>
  );
}
