import React, { useMemo, useState, useEffect } from 'react';
import { useGetEventsQuery, useGetEventsLatestQuery, useGetEventTypesQuery } from '../../redux/monitoring/monitoringApi';
import TableData from '../../Components/TableData/TableData';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import commonStyles from '../../styles/commonStyles.scss';
import { filterObjectByKeys } from '../../utils/helpers';
import queryString from 'query-string';
import { useSearchParams } from 'react-router-dom';

const initialHeadCells = [
  {
    id: 'type',
    label: 'Type',
    cellWidth: '15rem',
    alignContent: 'left',
    filterableBy: ['select'],
  },
  {
    id: 'createdAt',
    label: 'Date of occurrence',
    cellWidth: '15rem',
    alignContent: 'left',
    filterableBy: ['date'],
  },
  {
    id: 'properties',
    label: 'Properties',
    cellWidth: '15rem',
    alignContent: 'left',
  },
];

const PAGE = 'page';
const LIMIT = 'limit';
const FILTER_TYPE = 'filter[type]';
const FILTER_DATE_FROM = 'filter[createdAt][from]';
const FILTER_DATE_TO = 'filter[createdAt][to]';
const possibleQueryParams = [PAGE, LIMIT, FILTER_TYPE, FILTER_DATE_FROM, FILTER_DATE_TO];

const EventsDataType = {
  ALL: 'all',
  LATEST: 'latest',
};

export default function Events({ dataType = EventsDataType.ALL, ...props }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [headCells, setHeadCells] = useState(() => initialHeadCells);
  const [queryConfig, setQueryConfig] = useState(() => ({
    page: 1,
    limit: 20,
    cursor: null,
    orderBy: null,
    ...filterObjectByKeys(
      queryString.parse(searchParams.toString(), {
        parseNumbers: true,
        parseBooleans: true,
      }),
      possibleQueryParams,
    ),
  }));
  const { data: eventTypes } = useGetEventTypesQuery();
  const { data: response, isFetching } =
    EventsDataType.LATEST === dataType
      ? useGetEventsLatestQuery(queryConfig, { refetchOnMountOrArgChange: true })
      : useGetEventsQuery(queryConfig, { refetchOnMountOrArgChange: true });

  useEffect(() => {
    if (!eventTypes || eventTypes.data.length === 0) {
      return;
    }
    setHeadCells((prevState) => {
      const newState = [...prevState];
      const index = newState.findIndex((item) => item.id === 'type');
      newState[index] = {
        ...newState[index],
        possibleSelectionOptions: eventTypes.data,
      };
      return newState;
    });
  }, [eventTypes]);

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
    const events = response?.data || [];
    return events.map((event) => ({
      id: event.id,
      type: event.type,
      createdAt: new Date(event.createdAt).toLocaleString(),
      properties: <PropertiesDialog data={event} />,
    }));
  }, [response]);

  const handleTableChanges = (event) => {
    const fromDate = event.tableFilters.dateRange?.createdAt?.from || null;
    const toDate = event.tableFilters.dateRange?.createdAt?.to || null;

    const formatDate = (date) => {
      if (!date) {
        return null;
      }
      return new Date(date.getTime()).toISOString().split('.')[0] + 'Z';
    };

    setQueryConfig((prevState) => ({
      ...prevState,
      cursor: event.page === 1 ? null : response.meta.cursor,
      page: event.page,
      limit: event.rowsPerPage,
      'filter[type]': event.tableFilters.select?.type || null,
      'filter[createdAt][from]': formatDate(fromDate),
      'filter[createdAt][to]': formatDate(toDate),
    }));
  };

  return (
    <Card {...props}>
      <CardHeader title={EventsDataType.LATEST === dataType ? 'Latest events' : 'Events'} />
      <CardContent>
        <TableData
          headCells={headCells}
          rows={rows}
          onTableChange={handleTableChanges}
          isDataLoading={isFetching}
          paginationParams={{
            page: (queryConfig[PAGE] > response?.meta.lastPage ? response?.meta.lastPage : response?.meta.currentPage) || queryConfig[PAGE],
            lastPage: response?.meta.lastPage || 1,
            rowsPerPage: queryConfig[LIMIT] || 20,
            count: response?.meta.total || 0,
            showFirstButton: true,
            showLastButton: true,
          }}
          defaultParams={{
            tableFilters: {
              ...(queryConfig[FILTER_TYPE]
                ? {
                    select: {
                      type: Array.isArray(queryConfig[FILTER_TYPE]) ? queryConfig[FILTER_TYPE] : [queryConfig[FILTER_TYPE]],
                    },
                  }
                : {}),
              ...(queryConfig[FILTER_DATE_FROM] || queryConfig[FILTER_DATE_TO]
                ? {
                    dateRange: {
                      createdAt: {
                        from: queryConfig[FILTER_DATE_FROM] ? new Date(queryConfig[FILTER_DATE_FROM]) : null,
                        to: queryConfig[FILTER_DATE_TO] ? new Date(queryConfig[FILTER_DATE_TO]) : null,
                      },
                    },
                  }
                : {}),
            },
          }}
        />
      </CardContent>
    </Card>
  );
}

const PropertiesDialog = ({ data }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        sx={{ padding: 0, minWidth: 'auto', boxShadow: 'none', '&:hover': { backgroundColor: 'inherit' } }}
        variant="text"
        onClick={() => setOpen(true)}
      >
        Details
      </Button>
      <Dialog fullWidth maxWidth="sm" open={open} onClose={() => setOpen(false)}>
        <DialogTitle component="div" className={`${commonStyles.flex} ${commonStyles.justifySpaceBetween} ${commonStyles.alignCenter}`}>
          <Typography variant="h6">Details</Typography>
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon sx={{ color: 'secondary' }} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="none" align="left" sx={{ pt: 1, pb: 1 }}>
                  Type
                </TableCell>
                <TableCell padding="none" align="left" sx={{ pt: 1, pb: 1 }}>
                  Date of occurrence
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell padding="none" align="left" sx={{ pt: 1, pb: 1 }}>
                  {data.type}
                </TableCell>
                <TableCell padding="none" align="left" sx={{ pt: 1, pb: 1 }}>
                  {new Date(data.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Box sx={{ backgroundColor: 'gray', color: 'bodyColor', padding: 1, borderRadius: 1, maxHeight: '400px', overflow: 'auto' }}>
            <Typography component="pre" variant="body2">
              {JSON.stringify(data.properties, null, 2)}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
