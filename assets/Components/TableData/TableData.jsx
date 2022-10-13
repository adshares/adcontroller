import React, { createRef, useEffect, useMemo, useRef, useState } from 'react';
import { useSkipFirstRenderEffect } from '../../hooks';
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
  Menu,
  MenuItem,
  Divider,
  Popover,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
} from '@mui/material';
import commonStyles from '../../styles/commonStyles.scss';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import NumbersIcon from '@mui/icons-material/Numbers';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';

const descendingOrderComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

const getOrderComparator = (order, orderBy) => {
  return order === 'desc' ? (a, b) => descendingOrderComparator(a, b, orderBy) : (a, b) => -descendingOrderComparator(a, b, orderBy);
};

const sortByModel = (model, property) => (a, b) => {
  let ai = model.indexOf(a[property]);
  let bi = model.indexOf(b[property]);
  if (ai === -1) ai = 999;
  if (bi === -1) bi = 999;
  return ai - bi;
};

const filterFn = (arr, [head, query]) =>
  arr.filter((el) => (el[head] ? el[head].toString().toLowerCase().includes(query.toString().toLowerCase()) : true));

const multiFilterFn = (arr, filterBy) => {
  let result = [...arr];
  Object.keys(filterBy).forEach((prop) => {
    result = filterFn(result, [prop, filterBy[prop]]);
  });
  return result;
};

const renderSkeletons = (columns, rowsPerPage) => {
  const rows = [];

  for (let i = 0; i < rowsPerPage; i++) {
    rows.push(
      <TableRow key={i}>
        {columns.map((name) => (
          <TableCell key={`${name.id}-${i}`}>
            <Skeleton animation="wave" variant="text" />
          </TableCell>
        ))}
      </TableRow>,
    );
  }
  return rows;
};

const FilteringInformationBox = ({ headCells, filterBy, onRequestFilterByText, onRequestFilterByRange, onRequestFilterBySelect }) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleDelete = (opt, property) => {
    const { name, prop, el } = property;
    switch (opt) {
      case 'byText':
        const byTextEventSlice = {
          target: {
            value: null,
          },
        };
        onRequestFilterByText(byTextEventSlice, prop);
        break;

      case 'byRange':
        const byRangeEventSlice = {
          target: {
            value: null,
            name: name,
          },
        };
        onRequestFilterByRange(byRangeEventSlice, prop);
        break;

      case 'bySelect':
        const bySelectEventSlice = {
          target: {
            value: filterBy.select ? filterBy.select[prop].filter((val) => val !== el) : [],
          },
        };
        onRequestFilterBySelect(bySelectEventSlice, prop);
        break;

      default:
        break;
    }
  };

  const createFilterHandler = (event) => {
    onRequestFilterByText(event, 'all');
  };

  const chipsByText = filterBy.text
    ? Object.keys(filterBy.text)
        .map((filterName) => {
          const head = headCells.find((el) => el.id === filterName);
          return (
            head && (
              <ListItem disableGutters disablePadding sx={{ display: 'inline' }} key={filterName}>
                <Chip
                  sx={{ margin: 0.5 }}
                  size="small"
                  onDelete={() => handleDelete('byText', { prop: filterName })}
                  label={`${head.label}: ${filterBy.text[filterName]}`}
                />
              </ListItem>
            )
          );
        })
        .filter(Boolean)
    : [];

  const chipsByRange = filterBy.range
    ? Object.keys(filterBy.range)
        .map((filterName) => {
          const head = headCells.find((el) => el.id === filterName);
          return (
            head && (
              <ListItem disableGutters disablePadding sx={{ display: 'inline' }} key={filterName}>
                {filterBy.range[filterName]?.min && (
                  <Chip
                    sx={{ margin: 0.5 }}
                    size="small"
                    onDelete={() => handleDelete('byRange', { prop: filterName, name: 'min' })}
                    label={`${head.label} min: ${filterBy.range[filterName]?.min}`}
                  />
                )}
                {filterBy.range[filterName]?.max && (
                  <Chip
                    sx={{ margin: 0.5 }}
                    size="small"
                    onDelete={() => handleDelete('byRange', { prop: filterName, name: 'max' })}
                    label={`${head.label} max: ${filterBy.range[filterName]?.max}`}
                  />
                )}
              </ListItem>
            )
          );
        })
        .filter(Boolean)
    : [];

  const chipsBySelect = filterBy.select
    ? Object.keys(filterBy.select)
        .map((filterName) => {
          const head = headCells.find((el) => el.id === filterName);
          return (
            head &&
            filterBy.select[filterName].length &&
            filterBy.select[filterName].map((el) => (
              <ListItem disableGutters disablePadding sx={{ display: 'inline' }} dense key={filterName + el}>
                <Chip
                  sx={{ margin: 0.5 }}
                  size="small"
                  onDelete={() => handleDelete('bySelect', { prop: filterName, el })}
                  label={`${head.label}: ${el}`}
                />
              </ListItem>
            ))
          );
        })
        .filter(Boolean)
    : [];

  return (
    <Box>
      <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
        <Typography variant="h6">Filters</Typography>
        <IconButton onClick={() => setShowFilters((prevState) => !prevState)}>
          <FilterListIcon />
        </IconButton>
        <Collapse in={showFilters} timeout="auto">
          <TextField
            name="filterQuery"
            label="Filter all"
            fullWidth
            variant="outlined"
            size="small"
            margin="none"
            onChange={createFilterHandler}
            inputProps={{ autoComplete: 'off' }}
          />
        </Collapse>
      </Box>
      {!!chipsByText.length && (
        <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
          <Typography sx={{ whiteSpace: 'nowrap' }} variant="body1">
            By text:
          </Typography>
          <List>{chipsByText}</List>
        </Box>
      )}
      {!!chipsByRange.length && (
        <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
          <Typography sx={{ whiteSpace: 'nowrap' }} variant="body1">
            By range:
          </Typography>
          <List>{chipsByRange}</List>
        </Box>
      )}
      {!!chipsBySelect.length && (
        <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
          <Typography sx={{ whiteSpace: 'nowrap' }} variant="body1">
            By select:
          </Typography>
          <List>{chipsBySelect}</List>
        </Box>
      )}
    </Box>
  );
};

const ColumnSubMenu = ({ cellOptions, sxButton, onMenuItemClick, columnsPinnedToLeft }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <IconButton sx={sxButton} size="small" onClick={handleOpenMenu}>
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {cellOptions.filterableBy?.length && cellOptions.filterableBy.includes('text') && (
          <MenuItem onClick={() => onMenuItemClick(cellOptions.id, 'columnFilterByText', handleClose)}>
            <FilterListIcon />
            <Typography sx={{ pl: 1 }} variant="body1">
              Filter by text
            </Typography>
          </MenuItem>
        )}

        {cellOptions.filterableBy?.length && cellOptions.filterableBy.includes('range') && (
          <MenuItem onClick={() => onMenuItemClick(cellOptions.id, 'columnFilterByRange', handleClose)}>
            <NumbersIcon />
            <Typography sx={{ pl: 1 }} variant="body1">
              Filter by range
            </Typography>
          </MenuItem>
        )}

        {cellOptions.filterableBy?.length && cellOptions.filterableBy.includes('select') && (
          <MenuItem onClick={() => onMenuItemClick(cellOptions.id, 'columnFilterBySelect', handleClose)}>
            <LibraryAddCheckIcon />
            <Typography sx={{ pl: 1 }} variant="body1">
              Filter by select
            </Typography>
          </MenuItem>
        )}
        {cellOptions.filterableBy?.length && <Divider />}

        {columnsPinnedToLeft.includes(cellOptions.id) ? (
          <MenuItem onClick={() => onMenuItemClick(cellOptions.id, 'unpin', handleClose)}>
            <PushPinOutlinedIcon />
            <Typography sx={{ pl: 1 }} variant="body1">
              Unpin
            </Typography>
          </MenuItem>
        ) : (
          <MenuItem onClick={() => onMenuItemClick(cellOptions.id, 'pinToLeft', handleClose)}>
            <PushPinIcon />
            <Typography sx={{ pl: 1 }} variant="body1">
              Pin to left
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

const EnhancedTableHead = ({
  headCells,
  cellsWithFilterableBySelectValues,
  order,
  orderBy,
  onRequestSort,
  filterBy,
  pinnedToLeft,
  onRequestFilterByText,
  onRequestFilterByRange,
  onRequestFilterBySelect,
  onPinToLeftColumnRequest,
  onUnpinColumnRequest,
}) => {
  const { columnsPinnedToLeftIds, columnsPinnedToLeftWidth } = pinnedToLeft;
  const [showFilterByTextInput, setShowFilterByTextInput] = useState(headCells.reduce((acc, head) => ({ ...acc, [head.id]: false }), {}));
  const [showFilterByRangeInput, setShowFilterByRangeInput] = useState(headCells.reduce((acc, head) => ({ ...acc, [head.id]: false }), {}));
  const [showFilterBySelectInput, setShowFilterBySelectInput] = useState(
    headCells.reduce((acc, head) => ({ ...acc, [head.id]: false }), {}),
  );
  const [showColumnSubmenu, setShowColumnSubmenu] = useState(null);
  const headCellsRefs = useRef([]);

  useEffect(() => {
    headCellsRefs.current = headCells.map((cell, i) => headCellsRefs.current[i] ?? createRef());
  }, []);

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const createFilterByTextHandler = (property) => (event) => {
    onRequestFilterByText(event, property);
  };

  const createFilterByRangeHandler = (property) => (event) => {
    onRequestFilterByRange(event, property);
  };

  const createFilterBySelectHandler = (property) => (event) => {
    onRequestFilterBySelect(event, property);
  };

  const toggleShowFilterByText = (prop) => {
    setShowFilterByTextInput((prevState) => ({ ...prevState, [prop]: !prevState[prop] }));
  };

  const toggleShowFilterByRange = (prop) => {
    setShowFilterByRangeInput((prevState) => ({ ...prevState, [prop]: !prevState[prop] }));
  };

  const toggleShowFilterBySelect = (prop) => {
    setShowFilterBySelectInput((prevState) => ({ ...prevState, [prop]: !prevState[prop] }));
  };

  const handleMenuItemClick = (column, option, closeSubmenu) => {
    switch (option) {
      case 'columnFilterByText':
        toggleShowFilterByText(column);
        closeSubmenu();
        break;

      case 'columnFilterByRange':
        toggleShowFilterByRange(column);
        closeSubmenu();
        break;

      case 'columnFilterBySelect':
        toggleShowFilterBySelect(column);
        closeSubmenu();
        break;

      case 'pinToLeft':
        onPinToLeftColumnRequest(column);
        closeSubmenu();
        break;

      case 'unpin':
        onUnpinColumnRequest(column);
        closeSubmenu();
        break;

      default:
        break;
    }
  };

  return (
    <>
      <TableHead>
        <TableRow>
          {headCells.map((headCell, index) => {
            return (
              <TableCell
                ref={headCellsRefs.current[index]}
                padding="none"
                align="center"
                sx={{
                  ...(columnsPinnedToLeftIds.includes(headCell.id)
                    ? {
                        position: 'sticky',
                        left: columnsPinnedToLeftWidth[headCell.id] + 'rem' || 0,
                        borderRight: '1px solid rgba(224, 224, 224, 1)',
                        zIndex: 10,
                      }
                    : {}),
                  ...(index === headCells.length - 1 && headCell.pinToRight
                    ? { position: 'sticky', right: 0, zIndex: 10, borderLeft: '1px solid rgba(224, 224, 224, 1)' }
                    : {}),
                  minWidth: headCell.cellWidth,
                  pl: 1,
                  pr: 1,
                  pb: 0.5,
                  pt: 0.5,
                  backgroundColor: 'background.paper',
                }}
                size="small"
                key={headCell.id}
                id={headCell.id}
                onMouseEnter={() => setShowColumnSubmenu(headCell.id)}
                onMouseLeave={() => setShowColumnSubmenu(null)}
                sortDirection={headCell.sortable ? (orderBy === headCell.id ? order : false) : undefined}
              >
                <Box className={`${commonStyles.flex} ${commonStyles.alignCenter} ${commonStyles.justifyCenter}`}>
                  {!headCell.disableCellSubmenu && (
                    <ColumnSubMenu
                      cellOptions={headCell}
                      sxButton={showColumnSubmenu === headCell.id ? { visibility: 'visible' } : { visibility: 'hidden' }}
                      onMenuItemClick={handleMenuItemClick}
                      columnsPinnedToLeft={columnsPinnedToLeftIds}
                    />
                  )}

                  {headCell.sortable ? (
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
                <Popover
                  anchorEl={headCellsRefs.current?.find((ref) => ref.current?.id === headCell.id)?.current}
                  open={showFilterByTextInput[headCell.id]}
                  onClose={() => toggleShowFilterByText(headCell.id)}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                >
                  <Box sx={{ padding: '16px', width: headCell.cellWidth, minWidth: '15rem' }}>
                    <Typography variant="body1">Filter {headCell.label} by text</Typography>
                    <TextField
                      autoFocus
                      value={(filterBy.text && filterBy.text[headCell.id]) || ''}
                      name={headCell.id}
                      fullWidth
                      variant="standard"
                      size="small"
                      margin="none"
                      onChange={createFilterByTextHandler(headCell.id)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FilterListIcon />
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{ autoComplete: 'off' }}
                    />
                  </Box>
                </Popover>
                <Popover
                  anchorEl={headCellsRefs.current?.find((ref) => ref.current?.id === headCell.id)?.current}
                  open={showFilterByRangeInput[headCell.id]}
                  onClose={() => toggleShowFilterByRange(headCell.id)}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                >
                  <Box sx={{ padding: '16px', width: headCell.cellWidth, minWidth: '15rem' }}>
                    <Typography variant="body1">Filter {headCell.label} by range</Typography>
                    <Box className={`${commonStyles.flex}`}>
                      <TextField
                        sx={{ mr: 1 }}
                        autoFocus
                        value={(filterBy.range && filterBy.range[headCell.id]?.min) || ''}
                        name="min"
                        variant="standard"
                        size="small"
                        margin="none"
                        onChange={createFilterByRangeHandler(headCell.id)}
                        type="number"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">min</InputAdornment>,
                        }}
                        inputProps={{ autoComplete: 'off', min: 0 }}
                      />
                      <TextField
                        name="max"
                        value={(filterBy.range && filterBy.range[headCell.id]?.max) || ''}
                        variant="standard"
                        size="small"
                        margin="none"
                        onChange={createFilterByRangeHandler(headCell.id)}
                        type="number"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">max</InputAdornment>,
                        }}
                        inputProps={{ autoComplete: 'off', min: 0 }}
                      />
                    </Box>
                  </Box>
                </Popover>
                <Popover
                  anchorEl={headCellsRefs.current?.find((ref) => ref.current?.id === headCell.id)?.current}
                  open={showFilterBySelectInput[headCell.id]}
                  onClose={() => toggleShowFilterBySelect(headCell.id)}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                >
                  <Box sx={{ padding: '16px', width: headCell.cellWidth, minWidth: '15rem' }}>
                    <FormControl size="small" fullWidth>
                      <InputLabel id={headCell.id}>{`Filter ${headCell.label} by select`}</InputLabel>
                      <Select
                        MenuProps={{ sx: { maxHeight: '500px' } }}
                        labelId={headCell.id}
                        multiple
                        label={`Filter ${headCell.label} by select`}
                        value={filterBy.select ? filterBy.select[headCell.id] || [] : []}
                        onChange={createFilterBySelectHandler(headCell.id)}
                        renderValue={(selected) => selected.join(', ')}
                        onClose={() => toggleShowFilterBySelect(headCell.id)}
                      >
                        {cellsWithFilterableBySelectValues[headCell.id]?.map((value) => (
                          <MenuItem key={headCell.id + value} value={value}>
                            <Checkbox checked={filterBy.select ? filterBy.select[headCell.id]?.indexOf(value) > -1 : false} />
                            {value}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Popover>
              </TableCell>
            );
          })}
        </TableRow>
      </TableHead>
    </>
  );
};

export default function TableData({ defaultSortBy, headCells, rows, onTableChange, isDataLoading, padding = 'normal' }) {
  const initColumnPosition = headCells.map((cell) => cell.id);
  const [columns] = useState([...headCells]);
  const [columnsPinnedToLeftIds, setColumnsPinnedToLeftIds] = useState(
    headCells.filter((cell) => cell.pinnedToLeft).map((cell) => cell.id),
  );
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState(
    defaultSortBy && headCells.map((cell) => cell.id).includes(defaultSortBy)
      ? headCells.find((cell) => cell.id === defaultSortBy)?.id
      : headCells[0].id,
  );
  const [filterBy, setFilterBy] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  // const [offset, setOffset] = useState(page * rowsPerPage);

  const filteredRows = useMemo(() => multiFilterFn(rows, filterBy), [filterBy, rows]);

  const columnsPinnedToLeftWidth = useMemo(
    () =>
      columnsPinnedToLeftIds.reduce((acc, val, idx) => {
        const prevCellWidth = parseFloat(columns.find((cell) => cell.id === columnsPinnedToLeftIds[idx - 1])?.cellWidth || 0);
        return { ...acc, [val]: prevCellWidth + acc[columnsPinnedToLeftIds[idx - 1]] || 0 };
      }, {}),
    [columnsPinnedToLeftIds],
  );

  const cellsWithFilterableBySelectValues = useMemo(
    () =>
      headCells
        .filter((headCell) => headCell.filterableBy?.includes('select'))
        .reduce(
          (acc, val) => ({
            ...acc,
            [val.id]: rows.map((row) => row[val.id]).filter((value, index, self) => self.indexOf(value) === index),
          }),
          {},
        ),
    [headCells, rows],
  );

  useSkipFirstRenderEffect(() => {
    onTableChange({
      order,
      orderBy,
      filterBy,
      page,
      rowsPerPage,
      // offset,
    });
  }, [order, orderBy, page, filterBy, rowsPerPage]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleRequestFilterByText = (event, property) => {
    setFilterBy((prevState) => {
      const filterQueries = {
        ...prevState,
        text: {
          ...(prevState.text || {}),
          [property]: event.target.value,
        },
      };
      if (event.target.value === '' || event.target.value === null) {
        delete filterQueries.text[property];
      }

      if (!Object.keys(filterQueries.text).length) {
        delete filterQueries.text;
      }
      return filterQueries;
    });
  };

  const handleRequestFilterByRange = (event, property) => {
    setFilterBy((prevState) => {
      const filterQueries = {
        ...prevState,
        range: {
          ...(prevState.range || {}),
          [property]: { ...(prevState.range ? prevState.range[property] : {}), [event.target.name]: event.target.value },
        },
      };

      if (event.target.value === '' || event.target.value === null) {
        delete filterQueries.range[property][event.target.name];
      }

      if (!Object.keys(filterQueries.range[property]).length) {
        delete filterQueries.range[property];
      }

      if (!Object.keys(filterQueries.range).length) {
        delete filterQueries.range;
      }
      return filterQueries;
    });
  };

  const handleRequestFilterBySelect = (event, property) => {
    setFilterBy((prevState) => {
      const filterQueries = {
        ...prevState,
        select: {
          ...(prevState.select || {}),
          [property]: event.target.value || [],
        },
      };
      if (!Object.keys(filterQueries.select[property]).length) {
        delete filterQueries.select[property];
      }

      if (!Object.keys(filterQueries.select).length) {
        delete filterQueries.select;
      }
      return filterQueries;
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handlePinToLeft = (columnId) => {
    setColumnsPinnedToLeftIds((prevState) => [...prevState, columnId].filter((value, index, self) => self.indexOf(value) === index));
  };

  const handleUnpinColumn = (columnId) => {
    setColumnsPinnedToLeftIds((prevState) => prevState.filter((cell) => cell !== columnId));
  };

  return (
    <Box sx={{ height: '100%' }} className={`${commonStyles.flex} ${commonStyles.flexColumn}`}>
      <FilteringInformationBox
        onRequestFilterByText={handleRequestFilterByText}
        onRequestFilterByRange={handleRequestFilterByRange}
        onRequestFilterBySelect={handleRequestFilterBySelect}
        headCells={columns}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
      />
      <TableContainer>
        <Table stickyHeader padding={padding}>
          <EnhancedTableHead
            headCells={columns}
            cellsWithFilterableBySelectValues={cellsWithFilterableBySelectValues}
            order={order}
            orderBy={orderBy}
            filterBy={filterBy}
            onRequestSort={handleRequestSort}
            onRequestFilterByText={handleRequestFilterByText}
            onRequestFilterByRange={handleRequestFilterByRange}
            onRequestFilterBySelect={handleRequestFilterBySelect}
            onPinToLeftColumnRequest={handlePinToLeft}
            onUnpinColumnRequest={handleUnpinColumn}
            pinnedToLeft={{ columnsPinnedToLeftIds, columnsPinnedToLeftWidth }}
          />
          <TableBody>
            {!isDataLoading
              ? filteredRows
                  .sort(getOrderComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow hover tabIndex={-1} key={row.id}>
                      {columns
                        .sort(sortByModel(initColumnPosition, 'id'))
                        .sort(sortByModel(columnsPinnedToLeftIds, 'id'))
                        .map((cell, index) => {
                          return (
                            <TableCell
                              align={cell.alignContent || 'left'}
                              sx={{
                                ...(columnsPinnedToLeftIds.includes(cell.id)
                                  ? {
                                      position: 'sticky',
                                      left: columnsPinnedToLeftWidth[cell.id] + 'rem' || 0,
                                      borderRight: '1px solid rgba(224, 224, 224, 1)',
                                    }
                                  : {}),
                                ...(index === columns.length - 1 && cell.pinToRight
                                  ? { position: 'sticky', right: 0, borderLeft: '1px solid rgba(224, 224, 224, 1)' }
                                  : {}),
                                pl: 1,
                                pr: 1,
                                backgroundColor: 'background.paper',
                              }}
                              key={`${cell.id}-${row.id}`}
                            >
                              {row[cell.id]}
                            </TableCell>
                          );
                        })}
                    </TableRow>
                  ))
              : renderSkeletons(columns, rowsPerPage)}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        sx={{ overflow: 'visible' }}
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
