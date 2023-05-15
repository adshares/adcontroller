import React, { createRef, useEffect, useMemo, useRef, useState } from 'react';
import {
  Chip,
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
  Button,
  Tooltip,
} from '@mui/material';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import NumbersIcon from '@mui/icons-material/Numbers';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import commonStyles from '../../styles/commonStyles.scss';
import { useSkipFirstRenderEffect } from '../../hooks';

const sortByModel = (model, property) => (a, b) => {
  let ai = model.indexOf(a[property]);
  let bi = model.indexOf(b[property]);
  if (ai === -1) ai = 999;
  if (bi === -1) bi = 999;
  return ai - bi;
};

const checkNull = (obj) => {
  if (!obj) return null;
  const result = { ...obj };
  Object.keys(obj).forEach((key) => {
    if (obj[key] === null) {
      delete result[key];
    }
  });
  return result;
};

const renderSkeletons = (columns, rowsPerPage, rowHeight, rowsCount) => {
  const rows = [];

  for (let i = 0; i < (rowsCount || rowsPerPage); i++) {
    rows.push(
      <TableRow key={i}>
        {columns.map((name) => (
          <TableCell
            key={`${name.id}-${i}`}
            sx={{
              pl: 1,
              pr: 1,
              pt: 0.5,
              pb: 0.5,
              backgroundColor: 'background.paper',
              height: rowHeight + 'px' || undefined,
            }}
          >
            <Skeleton animation="wave" variant="text" />
          </TableCell>
        ))}
      </TableRow>,
    );
  }
  return rows;
};

const FilteringInformationBox = ({
  headCells,
  tableFilters,
  customFilters,
  onRequestFilterByText,
  onRequestFilterByRange,
  onRequestFilterByDateRange,
  onRequestFilterBySelect,
  onRequestCustomFilter,
  onRequestResetFilters,
  customFiltersEl,
}) => {
  const handleChipDelete = (opt, property) => {
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

      case 'byDateRange':
        const byDateRangeEventSlice = {
          [name]: null,
        };
        onRequestFilterByDateRange(byDateRangeEventSlice, prop);
        break;

      case 'bySelect':
        const bySelectEventSlice = {
          target: {
            value: tableFilters.select ? tableFilters.select[prop].filter((val) => val !== el) : [],
          },
        };
        onRequestFilterBySelect(bySelectEventSlice, prop);
        break;

      default:
        break;
    }
  };

  const chipsByText = tableFilters.text
    ? Object.keys(tableFilters.text)
        .map((filterName) => {
          const head = headCells.find((el) => el.id === filterName);
          return (
            head && (
              <ListItem disableGutters disablePadding sx={{ display: 'inline' }} key={filterName}>
                <Chip
                  sx={{ margin: 0.5 }}
                  size="small"
                  onDelete={() => handleChipDelete('byText', { prop: filterName })}
                  label={`${head.label}: ${tableFilters.text[filterName]}`}
                />
              </ListItem>
            )
          );
        })
        .filter(Boolean)
    : [];

  const chipsByRange = tableFilters.range
    ? Object.keys(tableFilters.range)
        .map((filterName) => {
          const head = headCells.find((el) => el.id === filterName);
          return (
            head && (
              <ListItem disableGutters disablePadding sx={{ display: 'inline' }} key={filterName}>
                {tableFilters.range[filterName]?.min && (
                  <Chip
                    sx={{ margin: 0.5 }}
                    size="small"
                    onDelete={() => handleChipDelete('byRange', { prop: filterName, name: 'min' })}
                    label={`${head.label} min: ${tableFilters.range[filterName]?.min}`}
                  />
                )}
                {tableFilters.range[filterName]?.max && (
                  <Chip
                    sx={{ margin: 0.5 }}
                    size="small"
                    onDelete={() => handleChipDelete('byRange', { prop: filterName, name: 'max' })}
                    label={`${head.label} max: ${tableFilters.range[filterName]?.max}`}
                  />
                )}
              </ListItem>
            )
          );
        })
        .filter(Boolean)
    : [];

  const chipsByDateRange = tableFilters.dateRange
    ? Object.keys(tableFilters.dateRange)
        .map((filterName) => {
          const head = headCells.find((el) => el.id === filterName);
          return (
            head && (
              <ListItem disableGutters disablePadding sx={{ display: 'inline' }} key={filterName}>
                {tableFilters.dateRange[filterName]?.from && (
                  <Chip
                    sx={{ margin: 0.5 }}
                    size="small"
                    onDelete={() => handleChipDelete('byDateRange', { prop: filterName, name: 'from' })}
                    label={`${head.label} from: ${tableFilters.dateRange[filterName]?.from.toLocaleString()}`}
                  />
                )}
                {tableFilters.dateRange[filterName]?.to && (
                  <Chip
                    sx={{ margin: 0.5 }}
                    size="small"
                    onDelete={() => handleChipDelete('byDateRange', { prop: filterName, name: 'to' })}
                    label={`${head.label} to: ${tableFilters.dateRange[filterName]?.to.toLocaleString()}`}
                  />
                )}
              </ListItem>
            )
          );
        })
        .filter(Boolean)
    : [];

  const chipsBySelect = tableFilters.select
    ? Object.keys(tableFilters.select)
        .map((filterName) => {
          const head = headCells.find((el) => el.id === filterName);
          return (
            head &&
            tableFilters.select[filterName].length &&
            tableFilters.select[filterName].map((el) => (
              <ListItem disableGutters disablePadding sx={{ display: 'inline' }} dense key={filterName + el}>
                <Chip
                  sx={{ margin: 0.5 }}
                  size="small"
                  onDelete={() => handleChipDelete('bySelect', { prop: filterName, el })}
                  label={`${head.label}: ${el}`}
                />
              </ListItem>
            ))
          );
        })
        .filter(Boolean)
    : [];

  return (
    (!!Object.keys(tableFilters).length || !!Object.keys(customFilters).length || !!customFiltersEl.length) && (
      <>
        <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
          <FilterAltOutlinedIcon sx={{ mr: 1 }} />
          <Typography variant="h3" component="h3">
            Filter:
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={onRequestResetFilters}
            disabled={!Object.keys(tableFilters).length && !Object.keys(customFilters).length}
            sx={{ ml: 'auto', '&[disabled]': { color: 'error.light', borderColor: 'error.light' } }}
            startIcon={<FilterListOffIcon />}
          >
            Reset filters
          </Button>
        </Box>
        {customFiltersEl.length > 0 && (
          <Box className={`${commonStyles.flex} ${commonStyles.flexWrap} ${commonStyles.alignBaseline}`}>
            {customFiltersEl.map((FilterElement, idx) => (
              <FilterElement key={idx} customFiltersHandler={onRequestCustomFilter} customFilters={customFilters} />
            ))}
          </Box>
        )}
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
        {!!chipsByDateRange.length && (
          <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
            <Typography sx={{ whiteSpace: 'nowrap' }} variant="body1">
              By date range:
            </Typography>
            <List>{chipsByDateRange}</List>
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
      </>
    )
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
      <Tooltip title="Column options">
        <IconButton sx={sxButton} size="small" onClick={handleOpenMenu}>
          <MoreVertIcon fontSize="small" color="black" />
        </IconButton>
      </Tooltip>
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
            <FilterListIcon color="black" />
            <Typography sx={{ pl: 1 }} variant="body1">
              Filter by text
            </Typography>
          </MenuItem>
        )}

        {cellOptions.filterableBy?.length && cellOptions.filterableBy.includes('range') && (
          <MenuItem onClick={() => onMenuItemClick(cellOptions.id, 'columnFilterByRange', handleClose)}>
            <NumbersIcon color="black" />
            <Typography sx={{ pl: 1 }} variant="body1">
              Filter by range
            </Typography>
          </MenuItem>
        )}

        {cellOptions.filterableBy?.length && cellOptions.filterableBy.includes('select') && (
          <MenuItem onClick={() => onMenuItemClick(cellOptions.id, 'columnFilterBySelect', handleClose)}>
            <LibraryAddCheckIcon color="black" />
            <Typography sx={{ pl: 1 }} variant="body1">
              Filter by select
            </Typography>
          </MenuItem>
        )}

        {cellOptions.filterableBy?.length && cellOptions.filterableBy.includes('date') && (
          <MenuItem onClick={() => onMenuItemClick(cellOptions.id, 'columnFilterByDate', handleClose)}>
            <CalendarMonthIcon color="black" />
            <Typography sx={{ pl: 1 }} variant="body1">
              Filter by date range
            </Typography>
          </MenuItem>
        )}

        {cellOptions.filterableBy?.length && <Divider />}

        {columnsPinnedToLeft.includes(cellOptions.id) ? (
          <MenuItem onClick={() => onMenuItemClick(cellOptions.id, 'unpin', handleClose)}>
            <PushPinOutlinedIcon color="black" />
            <Typography sx={{ pl: 1 }} variant="body1">
              Unpin
            </Typography>
          </MenuItem>
        ) : (
          <MenuItem onClick={() => onMenuItemClick(cellOptions.id, 'pinToLeft', handleClose)}>
            <PushPinIcon color="black" />
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
  multiSortParams,
  onRequestSort,
  tableFilters,
  pinnedToLeft,
  onRequestFilterByText,
  onRequestFilterByRange,
  onRequestFilterByDateRange,
  onRequestFilterBySelect,
  onPinToLeftColumnRequest,
  onUnpinColumnRequest,
}) => {
  const { columnsPinnedToLeftIds, columnsPinnedToLeftWidth } = pinnedToLeft;
  const [showFilterByTextInput, setShowFilterByTextInput] = useState(
    headCells.reduce(
      (acc, head) => ({
        ...acc,
        [head.id]: false,
      }),
      {},
    ),
  );
  const [showFilterByRangeInput, setShowFilterByRangeInput] = useState(
    headCells.reduce(
      (acc, head) => ({
        ...acc,
        [head.id]: false,
      }),
      {},
    ),
  );
  const [showFilterByDateRangeInput, setShowFilterByDateRangeInput] = useState(
    headCells.reduce(
      (acc, head) => ({
        ...acc,
        [head.id]: false,
      }),
      {},
    ),
  );
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

  const createFilterByDateRangeHandler = (property) => (event) => {
    onRequestFilterByDateRange(event, property);
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

  const toggleShowFilterByDate = (prop) => {
    setShowFilterByDateRangeInput((prevState) => ({ ...prevState, [prop]: !prevState[prop] }));
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

      case 'columnFilterByDate':
        toggleShowFilterByDate(column);
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
            const units = headCell.cellWidth
              .trim()
              .split(/\d+/g)
              .filter((n) => n)
              .pop()
              .trim();
            return (
              <TableCell
                ref={headCellsRefs.current[index]}
                align={headCell.alignContent || 'left'}
                sx={{
                  ...(columnsPinnedToLeftIds.includes(headCell.id)
                    ? {
                        position: 'sticky',
                        left: columnsPinnedToLeftWidth[headCell.id] + units || 0,
                        borderRight: '1px solid rgba(224, 224, 224, 1)',
                        zIndex: 10,
                      }
                    : {}),
                  ...(index === headCells.length - 1 && headCell.pinToRight
                    ? { position: 'sticky', right: 0, zIndex: 10, borderLeft: '1px solid rgba(224, 224, 224, 1)' }
                    : {}),
                  minWidth: headCell.cellWidth,
                  maxWidth: headCell.cellWidth,
                  width: headCell.cellWidth,
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
              >
                <Box
                  className={`${commonStyles.flex} ${commonStyles.alignCenter} 
                  ${
                    headCell.alignContent
                      ? (headCell.alignContent === 'center' && commonStyles.justifyCenter) ||
                        (headCell.alignContent === 'left' && commonStyles.justifyFlexStart) ||
                        (headCell.alignContent === 'right' && commonStyles.justifyFlexEnd)
                      : ''
                  }`}
                  sx={{
                    ...(headCell.alignContent
                      ? headCell.alignContent === 'right' &&
                        !headCell.sortable && {
                          pl: 1,
                          pr: 5,
                        }
                      : {}),
                  }}
                >
                  {!headCell.disableCellSubmenu && (
                    <ColumnSubMenu
                      cellOptions={headCell}
                      sxButton={showColumnSubmenu === headCell.id ? { visibility: 'visible' } : { visibility: 'hidden' }}
                      onMenuItemClick={handleMenuItemClick}
                      columnsPinnedToLeft={columnsPinnedToLeftIds}
                    />
                  )}

                  {headCell.sortable ? (
                    <>
                      <TableSortLabel
                        active={multiSortParams.hasOwnProperty(headCell.id)}
                        direction={multiSortParams[headCell.id] ? multiSortParams[headCell.id] : 'asc'}
                        onClick={createSortHandler(headCell.id)}
                        sx={{
                          '&::after': {
                            content:
                              multiSortParams.hasOwnProperty(headCell.id) && Object.keys(multiSortParams).length > 1
                                ? `'${Object.keys(multiSortParams).indexOf(headCell.id) + 1}'`
                                : '""',
                            position: 'relative',
                            bottom: '-5px',
                            left: '-5px',
                            color: 'blue.main',
                          },
                        }}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    </>
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
                  <Box sx={{ padding: '16px', width: '18rem' }}>
                    <Typography variant="body1">Filter {headCell.label} by text</Typography>
                    <TextField
                      autoFocus
                      value={(tableFilters.text && tableFilters.text[headCell.id]) || ''}
                      name={headCell.id}
                      fullWidth
                      variant="standard"
                      size="small"
                      margin="none"
                      onChange={createFilterByTextHandler(headCell.id)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FilterAltOutlinedIcon />
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
                  <Box sx={{ padding: '16px', width: '18rem' }}>
                    <Typography variant="body1">Filter {headCell.label} by range</Typography>
                    <Box className={`${commonStyles.flex}`}>
                      <TextField
                        sx={{ mr: 1 }}
                        autoFocus
                        value={(tableFilters.range && tableFilters.range[headCell.id]?.min) || ''}
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
                        value={(tableFilters.range && tableFilters.range[headCell.id]?.max) || ''}
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
                  open={showFilterByDateRangeInput[headCell.id]}
                  onClose={() => toggleShowFilterByDate(headCell.id)}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                >
                  <Box sx={{ padding: '16px', width: '18rem' }}>
                    <Typography variant="body1">Filter {headCell.label} by range</Typography>
                    <FilterByDateRange
                      createFilterByDateRangeHandler={createFilterByDateRangeHandler(headCell.id)}
                      initialState={tableFilters.dateRange && tableFilters.dateRange[headCell.id]}
                    />
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
                  <Box sx={{ padding: '16px', width: '18rem' }}>
                    <FormControl size="small" fullWidth>
                      <InputLabel id={headCell.id}>{`Filter ${headCell.label} by select`}</InputLabel>
                      <Select
                        MenuProps={{ sx: { maxHeight: '500px' } }}
                        labelId={headCell.id}
                        multiple
                        label={`Filter ${headCell.label} by select`}
                        value={tableFilters.select ? tableFilters.select[headCell.id] || [] : []}
                        onChange={createFilterBySelectHandler(headCell.id)}
                        renderValue={(selected) => selected.join(', ')}
                        onClose={() => toggleShowFilterBySelect(headCell.id)}
                      >
                        {cellsWithFilterableBySelectValues[headCell.id]?.map((value) => (
                          <MenuItem key={headCell.id + value} value={value}>
                            <Checkbox checked={tableFilters.select ? tableFilters.select[headCell.id]?.indexOf(value) > -1 : false} />
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

export default function TableData({
  multiSort = false,
  defaultParams = {
    orderBy: null,
    customFilters: null,
    tableFilters: null,
  },
  headCells,
  rows,
  onTableChange,
  isDataLoading,
  padding = 'normal',
  paginationParams,
  customFiltersEl = [],
}) {
  const initColumnPosition = [...headCells.map((cell) => cell.id)];
  const [columnsPinnedToLeftIds, setColumnsPinnedToLeftIds] = useState(
    headCells.filter((cell) => cell.pinnedToLeft).map((cell) => cell.id),
  );
  const [orderBy, setOrderBy] = useState(defaultParams.orderBy || {});
  const [tableFilters, setTableFilters] = useState(checkNull(defaultParams.tableFilters) || {});
  const [customFilters, setCustomFilters] = useState(checkNull(defaultParams.customFilters) || {});
  const [page, setPage] = useState(Number(paginationParams.page - 1));
  const [rowsPerPage, setRowsPerPage] = useState(Number(paginationParams.rowsPerPage));
  const rowsPerPagePaginationOptions = [rowsPerPage, 20, 50, 100].filter((el, idx, self) => self.indexOf(el) === idx).sort((a, b) => a - b);
  const rowRef = useRef(null);
  const sortableColumns = headCells.filter((cell) => cell.sortable).map((cell) => cell.id);

  useEffect(() => {
    if (isNaN(page)) {
      setPage(0);
    }
    if (page < 0) {
      setPage(0);
    }
    if (isNaN(rowsPerPage)) {
      setRowsPerPage(20);
    }
    if (rowsPerPage < 0) {
      setRowsPerPage(20);
    }
    if (Object.keys(orderBy).length) {
      setOrderBy((prevState) => {
        const result = { ...prevState };
        Object.entries(orderBy).forEach(([order, direction]) => {
          if (!sortableColumns.includes(order)) {
            delete result[order];
          }

          if (direction !== 'asc' && direction !== 'desc') {
            delete result[order];
          }
        });
        return result;
      });
    }
  }, []);

  useSkipFirstRenderEffect(() => {
    onTableChange({
      orderBy,
      tableFilters,
      customFilters,
      page: page + 1,
      rowsPerPage,
    });
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, [orderBy, page, tableFilters, customFilters, rowsPerPage]);

  const rowHeight = useMemo(() => {
    return rowRef.current?.clientHeight;
  }, [rowRef.current]);

  const columns = useMemo(() => [...headCells], [headCells]);

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
            [val.id]:
              val.possibleSelectionOptions || rows.map((row) => row[val.id]).filter((value, index, self) => self.indexOf(value) === index),
          }),
          {},
        ),
    [headCells, rows],
  );

  const handleRequestSort = (event, property) => {
    setOrderBy((prevState) => {
      const newSortParams = {
        ...(multiSort ? prevState : {}),
        [property]: prevState[property] === 'asc' ? 'desc' : 'asc',
      };
      if (prevState[property] === 'desc') {
        delete newSortParams[property];
      }
      return newSortParams;
    });
  };

  const handleRequestFilterByText = (event, property) => {
    setTableFilters((prevState) => {
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
    setTableFilters((prevState) => {
      const filterQueries = {
        ...prevState,
        range: {
          ...(prevState.range || {}),
          [property]: {
            ...(prevState.range ? prevState.range[property] : {}),
            [event.target.name]: event.target.value,
          },
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

  const handleRequestFilterByDateRange = (event, property) => {
    setTableFilters((prevState) => {
      const filterQueries = {
        ...prevState,
        dateRange: {
          ...(prevState.dateRange || {}),
          [property]: {
            ...(prevState.dateRange ? prevState.dateRange[property] : {}),
            ...event,
          },
        },
      };

      if (filterQueries.dateRange[property].from === null && filterQueries.dateRange[property].to === null) {
        delete filterQueries.dateRange[property];
      }
      if (!Object.keys(filterQueries.dateRange).length) {
        delete filterQueries.dateRange;
      }
      return filterQueries;
    });
    setPage(0);
  };

  const handleRequestFilterBySelect = (event, property) => {
    setTableFilters((prevState) => {
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
    setPage(0);
  };

  const handleRequestCustomFilter = (entries) => {
    setCustomFilters((prevState) => {
      const filterQueries = {
        ...prevState,
        ...entries,
      };
      Object.entries(entries).forEach((entry) => {
        if (entry[1] === null || entry[1] === '') {
          delete filterQueries[entry[0]];
        }
      });

      return filterQueries;
    });
    setPage(0);
  };

  const resetFilters = () => {
    setCustomFilters({});
    setTableFilters({});
    setPage(0);
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
    <>
      <FilteringInformationBox
        onRequestFilterByText={handleRequestFilterByText}
        onRequestFilterByRange={handleRequestFilterByRange}
        onRequestFilterByDateRange={handleRequestFilterByDateRange}
        onRequestFilterBySelect={handleRequestFilterBySelect}
        onRequestCustomFilter={handleRequestCustomFilter}
        onRequestResetFilters={resetFilters}
        headCells={columns}
        orderBy={orderBy}
        tableFilters={tableFilters}
        customFilters={customFilters}
        setFilterBy={setTableFilters}
        customFiltersEl={customFiltersEl}
      />
      <TableContainer>
        <Table stickyHeader padding={padding}>
          <EnhancedTableHead
            headCells={columns}
            cellsWithFilterableBySelectValues={cellsWithFilterableBySelectValues}
            multiSortParams={orderBy}
            tableFilters={tableFilters}
            customFilters={customFilters}
            onRequestSort={handleRequestSort}
            onRequestFilterByText={handleRequestFilterByText}
            onRequestFilterByRange={handleRequestFilterByRange}
            onRequestFilterByDateRange={handleRequestFilterByDateRange}
            onRequestFilterBySelect={handleRequestFilterBySelect}
            onPinToLeftColumnRequest={handlePinToLeft}
            onUnpinColumnRequest={handleUnpinColumn}
            pinnedToLeft={{ columnsPinnedToLeftIds, columnsPinnedToLeftWidth }}
          />
          <TableBody>
            {!isDataLoading
              ? rows.map((row) => (
                  <TableRow
                    ref={(row) => {
                      if (row) {
                        rowRef.current = row;
                      }
                    }}
                    hover
                    tabIndex={-1}
                    key={row.id}
                  >
                    {columns
                      .sort(sortByModel(initColumnPosition, 'id'))
                      .sort(sortByModel(columnsPinnedToLeftIds, 'id'))
                      .map((cell, index) => {
                        const units = cell.cellWidth
                          .trim()
                          .split(/\d+/g)
                          .filter((n) => n)
                          .pop()
                          .trim();
                        return (
                          <TableCell
                            align={cell.alignContent || 'left'}
                            sx={{
                              ...(columnsPinnedToLeftIds.includes(cell.id)
                                ? {
                                    position: 'sticky',
                                    left: columnsPinnedToLeftWidth[cell.id] + units || 0,
                                    borderRight: '1px solid rgba(224, 224, 224, 1)',
                                  }
                                : {}),
                              ...(index === columns.length - 1 && cell.pinToRight
                                ? { position: 'sticky', right: 0, borderLeft: '1px solid rgba(224, 224, 224, 1)' }
                                : {}),
                              maxWidth: cell.cellWidth,
                              pl: 1,
                              pr: 1,
                              pt: 0.5,
                              pb: 0.5,
                              backgroundColor: 'background.paper',
                              ...(cell.alignContent
                                ? (cell.alignContent === 'center' && { pl: 1, pr: 1 }) ||
                                  (cell.alignContent === 'left' && { pl: cell.disableCellSubmenu ? 1 : 5, pr: 1 }) ||
                                  (cell.alignContent === 'right' && { pl: 1, pr: 5 })
                                : {}),
                            }}
                            key={`${cell.id}-${row.id}`}
                          >
                            {row[cell.id]}
                          </TableCell>
                        );
                      })}
                  </TableRow>
                ))
              : renderSkeletons(columns, rowsPerPage, rowHeight, rows.length)}
          </TableBody>
        </Table>
      </TableContainer>
      {!isDataLoading && !rows.length && (
        <Typography align="center" variant="h2" color="secondaryAlt.main" sx={{ mt: 4, mb: 4 }}>
          NO RESULTS
        </Typography>
      )}
      {!isDataLoading && (
        <TablePagination
          sx={{ overflow: 'visible', marginTop: 'auto' }}
          component="div"
          onPageChange={handleChangePage}
          page={paginationParams.count <= 0 ? 0 : page > paginationParams.lastPage ? paginationParams.lastPage - 1 : page}
          count={paginationParams.count || rows.length}
          rowsPerPage={rowsPerPage <= 0 ? 1 : rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={rowsPerPagePaginationOptions}
          showFirstButton={paginationParams.showFirstButton || undefined}
          showLastButton={paginationParams.showLastButton || undefined}
        />
      )}
    </>
  );
}

const FilterByDateRange = ({ createFilterByDateRangeHandler, initialState = { from: null, to: null } }) => {
  const dateRegExp = new RegExp(/^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-[12]\d{3}$/, 'i');
  const dateTimeRegExp = new RegExp(/((0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-[12]\d{3} ([01]\d|2[0-3]):[0-5]\d)$/, 'i');
  const [dateState, setDateState] = useState({
    fromDate: {
      ...(initialState.from
        ? { value: dayjs(initialState.from), string: dayjs(initialState.from).format('DD-MM-YYYY HH:mm') }
        : { value: null, string: null }),
    },
    toDate: {
      ...(initialState.to
        ? { value: dayjs(initialState.to), string: dayjs(initialState.to).format('DD-MM-YYYY HH:mm') }
        : { value: null, string: null }),
    },
  });
  const [prevPickedDate, setPrevPickedDate] = useState({ fromDate: dateState.fromDate.string, toDate: null });
  const [errorObj, setErrorObj] = useState({
    fromDate: { reason: null, isValid: false },
    toDate: { reason: null, isValid: false },
  });

  useEffect(() => {
    validateDate();
  }, [dateState]);

  const onPickerChange = (name) => (newValue) => {
    setDateState((prevState) => ({
      ...prevState,
      [name]: {
        value: newValue,
        string: dayjs(newValue).isValid() ? dayjs(newValue).format('DD-MM-YYYY HH:mm') : null,
      },
    }));
  };

  const validateDate = () => {
    const fromDateValidationResult = {
      isValid: true,
      reason: '',
    };
    const toDateValidationResult = {
      isValid: true,
      reason: '',
    };

    const fromDate =
      dateState.fromDate.string && dateRegExp.test(dateState.fromDate.string.trim())
        ? dayjs(dateState.fromDate.string + '00:00', 'DD/MM/YYYY HH/mm')
        : dayjs(dateState.fromDate.string, 'DD/MM/YYYY HH/mm');

    const toDate =
      dateState.toDate.string && dateRegExp.test(dateState.toDate.string.trim())
        ? dayjs(dateState.toDate.string + '00:00', 'DD/MM/YYYY HH/mm')
        : dayjs(dateState.toDate.string, 'DD/MM/YYYY HH/mm');

    if (
      !!dateState.fromDate.string &&
      !dateTimeRegExp.test(dateState.fromDate.string) &&
      !dateRegExp.test(dateState.fromDate.string.trim())
    ) {
      fromDateValidationResult.isValid = false;
      fromDateValidationResult.reason = 'Date format DD-MM-YY HH:mm';
    }

    if (
      !!dateState.toDate.string &&
      !dateTimeRegExp.test(dateState.toDate.string.trim()) &&
      !dateRegExp.test(dateState.toDate.string.trim())
    ) {
      toDateValidationResult.isValid = false;
      toDateValidationResult.reason = 'Date format DD-MM-YY HH:mm';
    }

    if (dateState.fromDate.value !== null && !fromDate.isValid()) {
      fromDateValidationResult.isValid = false;
      fromDateValidationResult.reason = 'Date format DD-MM-YY HH:mm';
    }
    if (dateState.toDate.value !== null && !toDate.isValid()) {
      toDateValidationResult.isValid = false;
      toDateValidationResult.reason = 'Date format DD-MM-YY HH:mm';
    }
    if (!isNaN(toDate.diff(fromDate)) && toDate.diff(fromDate) < 0) {
      toDateValidationResult.isValid = false;
      toDateValidationResult.reason = 'Invalid time range: "From" must be earlier than "To"';
    }

    setErrorObj((prevState) => ({
      ...prevState,
      fromDate: fromDateValidationResult,
      toDate: toDateValidationResult,
    }));
  };

  const onInputBlur = (name) => (e) => {
    if (dateRegExp.test(e.target.value.trim())) {
      onPickerChange(name)(dayjs(e.target.value + '00:00', 'DD/MM/YYYY HH/mm'), e.target.value + '00:00');
    }
  };

  const onApplyClick = () => {
    setPrevPickedDate({
      fromDate: dateState.fromDate.value && dayjs(dateState.fromDate.value).format('DD-MM-YYYY HH:mm'),
      toDate: dateState.toDate.value && dayjs(dateState.toDate.value).format('DD-MM-YYYY HH:mm'),
    });
    createFilterByDateRangeHandler({
      from: dateState.fromDate.value && dateState.fromDate.value.$d,
      to: dateState.toDate.value && dateState.toDate.value.$d,
    });
  };

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          ampm={false}
          label="From"
          format={'DD-MM-YYYY HH:mm'}
          value={dateState.fromDate.value}
          onChange={onPickerChange('fromDate')}
          slotProps={{
            textField: {
              error: !errorObj.fromDate.isValid,
              helperText: !errorObj.fromDate.isValid ? errorObj.fromDate.reason : undefined,
              onBlur: onInputBlur('fromDate'),
              size: 'small',
              margin: 'dense',
            },
          }}
        />
        <DateTimePicker
          minDate={dateState.fromDate.value}
          ampm={false}
          label="To"
          value={dateState.toDate.value}
          format={'DD-MM-YYYY HH:mm'}
          onChange={onPickerChange('toDate')}
          slotProps={{
            textField: {
              error: !errorObj.toDate.isValid,
              helperText: !errorObj.toDate.isValid ? errorObj.toDate.reason : undefined,
              onBlur: onInputBlur('toDate'),
              size: 'small',
              margin: 'dense',
            },
          }}
        />
      </LocalizationProvider>
      <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
        <Button
          disabled={
            !errorObj.fromDate.isValid ||
            !errorObj.toDate.isValid ||
            (prevPickedDate.fromDate === dateState.fromDate.string && prevPickedDate.toDate === dateState.toDate.string)
          }
          onClick={onApplyClick}
          variant="contained"
        >
          Apply
        </Button>
      </Box>
    </>
  );
};
