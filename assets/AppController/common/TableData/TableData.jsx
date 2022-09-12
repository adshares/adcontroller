import React, { useMemo, useState } from 'react';
import { useSkipFirstRenderEffect } from '../../../hooks';
import {
  Chip,
  Collapse,
  InputAdornment,
  List,
  ListItem,
  Skeleton,
  TextField,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
  IconButton,
} from '@mui/material';
import commonStyles from '../commonStyles.scss';
import FilterListIcon from '@mui/icons-material/FilterList';

const descendingComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

const getComparator = (order, orderBy) => {
  return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
};

const renderSkeletons = (columns) => {
  const rows = [];

  for (let i = 0; i < 5; i++) {
    rows.push(
      <TableRow key={i}>
        {columns.map((name) => (
          <TableCell key={`${name}-${i}`}>
            <Skeleton animation="wave" variant="text" />
          </TableCell>
        ))}
      </TableRow>,
    );
  }
  return rows;
};

const filterFn = (arr, [head, query]) => arr.filter((el) => el[head].toLowerCase().includes(query.toLowerCase()));

const multiFilterFn = (arr, filterBy) => {
  let result = [...arr];
  Object.keys(filterBy).forEach((prop) => {
    result = filterFn(result, [prop, filterBy[prop]]);
  });
  return result;
};

const EnhancedTableHead = ({ order, orderBy, onRequestSort, filterBy, onRequestFilter, headCells }) => {
  const [showFilteringField, setShowFilteringField] = useState(headCells.reduce((acc, head) => ({ ...acc, [head.id]: false }), {}));

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const createFilterHandler = (property) => (event) => {
    onRequestFilter(event, property);
  };

  const toggleShowFiltering = (prop) => {
    setShowFilteringField((prevState) => ({ ...prevState, [prop]: !prevState[prop] }));
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            width={headCell.cellWidth}
            key={headCell.id}
            sortDirection={headCell.sort ? (orderBy === headCell.id ? order : false) : undefined}
          >
            <Collapse in={!showFilteringField[headCell.id]}>
              <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
                <IconButton size="small" onClick={() => toggleShowFiltering(headCell.id)}>
                  <FilterListIcon />
                </IconButton>
                {headCell.sort ? (
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={createSortHandler(headCell.id)}
                  >
                    {headCell.label}
                  </TableSortLabel>
                ) : (
                  headCell.label
                )}
              </Box>
            </Collapse>
            <Collapse in={showFilteringField[headCell.id]}>
              <TextField
                inputRef={(input) => {
                  if (input && showFilteringField[headCell.id]) {
                    input.focus();
                  }
                  if (input && !filterBy[headCell.id]) {
                    input.value = '';
                  }
                }}
                name={headCell.id}
                fullWidth
                variant="standard"
                size="small"
                margin="none"
                onChange={createFilterHandler(headCell.id)}
                onBlur={() => toggleShowFiltering(headCell.id)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton type="button" onClick={() => toggleShowFiltering(headCell.id)}>
                        <FilterListIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                inputProps={{ autoComplete: 'off' }}
              />
            </Collapse>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

const FilteringInformationField = ({ headCells, filterBy, setFilterBy }) => {
  const handleDelete = (property) => {
    setFilterBy((prevState) => {
      const filtersPhrases = {
        ...prevState,
      };
      delete filtersPhrases[property];
      return filtersPhrases;
    });
  };

  const chips = Object.keys(filterBy).map((filterName) => {
    const head = headCells.find((el) => el.id === filterName);
    return (
      <ListItem sx={{ display: 'inline' }} key={filterName}>
        <Chip onDelete={() => handleDelete(filterName)} label={`${head.label}: ${filterBy[filterName]}`} />
      </ListItem>
    );
  });

  return (
    <Box>
      <Collapse in={Object.keys(filterBy).length > 0} timeout="auto">
        <Typography sx={{ flex: '1 1 100%' }} variant="body1" id="tableTitle" component="div">
          Filters:
        </Typography>
        <List>{chips}</List>
      </Collapse>
    </Box>
  );
};

export default function TableData({ headCells, rows, onTableChange, isDataLoading }) {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState(headCells[0].id);
  const [filterBy, setFilterBy] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const columnNames = headCells.map((headCell) => headCell.id);

  const filteredRows = useMemo(() => multiFilterFn(rows, filterBy), [filterBy]);

  useSkipFirstRenderEffect(() => {
    onTableChange({
      order,
      orderBy,
      filterBy,
      page,
    });
  }, [order, orderBy, page, filterBy]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleRequestFilter = (event, property) => {
    setFilterBy((prevState) => {
      const filtersPhrases = {
        ...prevState,
        [property]: event.target.value,
      };
      if (event.target.value === '') {
        delete filtersPhrases[property];
      }
      return filtersPhrases;
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <FilteringInformationField headCells={headCells} filterBy={filterBy} setFilterBy={setFilterBy} />
      <TableContainer>
        <Table size="medium">
          <EnhancedTableHead
            headCells={headCells}
            order={order}
            orderBy={orderBy}
            filterBy={filterBy}
            onRequestSort={handleRequestSort}
            onRequestFilter={handleRequestFilter}
          />
          <TableBody>
            {!isDataLoading
              ? filteredRows
                  .sort(getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => {
                    return (
                      <TableRow hover tabIndex={-1} key={row.id}>
                        {columnNames.map((name) => (
                          <TableCell key={`${name}-${row.id}`}>{row[name]}</TableCell>
                        ))}
                      </TableRow>
                    );
                  })
              : renderSkeletons(columnNames)}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 15, 20]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}
