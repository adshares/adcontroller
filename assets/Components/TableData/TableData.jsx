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
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import NumbersIcon from '@mui/icons-material/Numbers';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import commonStyles from '../../styles/commonStyles.scss';

const sortByModel = (model, property) => (a, b) => {
  let ai = model.indexOf(a[property]);
  let bi = model.indexOf(b[property]);
  if (ai === -1) ai = 999;
  if (bi === -1) bi = 999;
  return ai - bi;
};

const renderSkeletons = (columns, rowsPerPage) => {
  const rows = [];

  for (let i = 0; i < rowsPerPage; i++) {
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
  filterBy,
  onRequestFilterByText,
  onRequestFilterByRange,
  onRequestFilterByDateRange,
  onRequestFilterBySelect,
  onRequestCustomFilter,
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
            value: filterBy.select ? filterBy.select[prop].filter((val) => val !== el) : [],
          },
        };
        onRequestFilterBySelect(bySelectEventSlice, prop);
        break;

      default:
        break;
    }
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
                  onDelete={() => handleChipDelete('byText', { prop: filterName })}
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
                    onDelete={() => handleChipDelete('byRange', { prop: filterName, name: 'min' })}
                    label={`${head.label} min: ${filterBy.range[filterName]?.min}`}
                  />
                )}
                {filterBy.range[filterName]?.max && (
                  <Chip
                    sx={{ margin: 0.5 }}
                    size="small"
                    onDelete={() => handleChipDelete('byRange', { prop: filterName, name: 'max' })}
                    label={`${head.label} max: ${filterBy.range[filterName]?.max}`}
                  />
                )}
              </ListItem>
            )
          );
        })
        .filter(Boolean)
    : [];

  const chipsByDateRange = filterBy.dateRange
    ? Object.keys(filterBy.dateRange)
        .map((filterName) => {
          const head = headCells.find((el) => el.id === filterName);
          return (
            head && (
              <ListItem disableGutters disablePadding sx={{ display: 'inline' }} key={filterName}>
                {filterBy.dateRange[filterName]?.from && (
                  <Chip
                    sx={{ margin: 0.5 }}
                    size="small"
                    onDelete={() => handleChipDelete('byDateRange', { prop: filterName, name: 'from' })}
                    label={`${head.label} from: ${filterBy.dateRange[filterName]?.from.toLocaleString()}`}
                  />
                )}
                {filterBy.dateRange[filterName]?.to && (
                  <Chip
                    sx={{ margin: 0.5 }}
                    size="small"
                    onDelete={() => handleChipDelete('byDateRange', { prop: filterName, name: 'to' })}
                    label={`${head.label} to: ${filterBy.dateRange[filterName]?.to.toLocaleString()}`}
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
    <Box>
      <Box className={`${commonStyles.flex} ${commonStyles.alignCenter} ${commonStyles.flexWrap}`}>
        {customFiltersEl.length > 0 &&
          customFiltersEl.map((FilterElement, idx) => (
            <FilterElement key={idx} customFiltersHandler={onRequestCustomFilter} filterBy={filterBy} />
          ))}
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
      <Tooltip title="Column options">
        <IconButton sx={sxButton} size="small" onClick={handleOpenMenu}>
          <MoreVertIcon fontSize="small" />
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
            <FilterListIcon color="action" />
            <Typography sx={{ pl: 1 }} variant="body1">
              Filter by text
            </Typography>
          </MenuItem>
        )}

        {cellOptions.filterableBy?.length && cellOptions.filterableBy.includes('range') && (
          <MenuItem onClick={() => onMenuItemClick(cellOptions.id, 'columnFilterByRange', handleClose)}>
            <NumbersIcon color="action" />
            <Typography sx={{ pl: 1 }} variant="body1">
              Filter by range
            </Typography>
          </MenuItem>
        )}

        {cellOptions.filterableBy?.length && cellOptions.filterableBy.includes('select') && (
          <MenuItem onClick={() => onMenuItemClick(cellOptions.id, 'columnFilterBySelect', handleClose)}>
            <LibraryAddCheckIcon color="action" />
            <Typography sx={{ pl: 1 }} variant="body1">
              Filter by select
            </Typography>
          </MenuItem>
        )}

        {cellOptions.filterableBy?.length && cellOptions.filterableBy.includes('date') && (
          <MenuItem onClick={() => onMenuItemClick(cellOptions.id, 'columnFilterByDate', handleClose)}>
            <CalendarMonthIcon color="action" />
            <Typography sx={{ pl: 1 }} variant="body1">
              Filter by date range
            </Typography>
          </MenuItem>
        )}

        {cellOptions.filterableBy?.length && <Divider />}

        {columnsPinnedToLeft.includes(cellOptions.id) ? (
          <MenuItem onClick={() => onMenuItemClick(cellOptions.id, 'unpin', handleClose)}>
            <PushPinOutlinedIcon color="action" />
            <Typography sx={{ pl: 1 }} variant="body1">
              Unpin
            </Typography>
          </MenuItem>
        ) : (
          <MenuItem onClick={() => onMenuItemClick(cellOptions.id, 'pinToLeft', handleClose)}>
            <PushPinIcon color="action" />
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
  filterBy,
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
                align="center"
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
                    <>
                      <TableSortLabel
                        active={multiSortParams.hasOwnProperty(headCell.id)}
                        direction={multiSortParams[headCell.id] ? multiSortParams[headCell.id] : 'asc'}
                        onClick={createSortHandler(headCell.id)}
                        sx={{
                          '&.MuiTableSortLabel-root.Mui-active': {
                            '& .MuiTableSortLabel-icon': {
                              color: 'primary.main',
                            },
                          },
                          '&::after': {
                            content:
                              multiSortParams.hasOwnProperty(headCell.id) && Object.keys(multiSortParams).length > 1
                                ? `'${Object.keys(multiSortParams).indexOf(headCell.id) + 1}'`
                                : '""',
                            position: 'relative',
                            bottom: '-5px',
                            left: '-5px',
                            color: 'primary.main',
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
                  <Box sx={{ padding: '16px', width: '18rem' }}>
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
                      initialState={filterBy.dateRange && filterBy.dateRange[headCell.id]}
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

export default function TableData({
  multiSort = false,
  defaultOrderBy = undefined,
  defaultFilterBy = undefined,
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
  const [multiSortParams, setMultiSortParams] = useState(defaultOrderBy || {});
  const [filterBy, setFilterBy] = useState({ ...defaultFilterBy });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(paginationParams.limit);

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

  useEffect(() => {
    onTableChange({
      orderBy: multiSortParams,
      filterBy,
      page: page + 1,
      rowsPerPage,
    });
  }, [multiSortParams, page, filterBy, rowsPerPage]);

  const handleRequestSort = (event, property) => {
    setMultiSortParams((prevState) => {
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
    setFilterBy((prevState) => {
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
    setPage(0);
  };

  const handleRequestCustomFilter = (entries) => {
    console.log(entries);
    setFilterBy((prevState) => {
      const filterQueries = {
        ...prevState,
        ...entries,
      };
      Object.entries(entries).forEach((entry) => {
        if (entry[1] === null) {
          delete filterQueries[entry[0]];
        }
      });

      return filterQueries;
    });
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
    <Box sx={{ height: '100%' }} className={`${commonStyles.flex} ${commonStyles.flexColumn}`}>
      <FilteringInformationBox
        onRequestFilterByText={handleRequestFilterByText}
        onRequestFilterByRange={handleRequestFilterByRange}
        onRequestFilterByDateRange={handleRequestFilterByDateRange}
        onRequestFilterBySelect={handleRequestFilterBySelect}
        onRequestCustomFilter={handleRequestCustomFilter}
        headCells={columns}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
        customFiltersEl={customFiltersEl}
      />
      <TableContainer>
        <Table stickyHeader padding={padding}>
          <EnhancedTableHead
            headCells={columns}
            cellsWithFilterableBySelectValues={cellsWithFilterableBySelectValues}
            multiSortParams={multiSortParams}
            filterBy={filterBy}
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
                  <TableRow hover tabIndex={-1} key={row.id}>
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
                              pl: 1,
                              pr: 1,
                              pt: 0.5,
                              pb: 0.5,
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
        sx={{ overflow: 'visible', marginTop: 'auto' }}
        component="div"
        onPageChange={handleChangePage}
        page={page}
        count={paginationParams.count || rows.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 15, 20]}
        showFirstButton={paginationParams.showFirstButton || undefined}
        showLastButton={paginationParams.showLastButton || undefined}
      />
    </Box>
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

  const onPickerChange = (name) => (newValue, string) => {
    setDateState((prevState) => ({
      ...prevState,
      [name]: {
        value: newValue,
        string: string || (dayjs(newValue).isValid() ? dayjs(newValue).format('DD-MM-YYYY HH:mm') : null),
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
          inputFormat={'DD-MM-YYYY HH:mm'}
          value={dateState.fromDate.value}
          onChange={onPickerChange('fromDate')}
          renderInput={(params) => {
            params.error = !errorObj.fromDate.isValid;
            return (
              <TextField
                helperText={!errorObj.fromDate.isValid ? errorObj.fromDate.reason : undefined}
                onBlur={onInputBlur('fromDate')}
                size="small"
                margin="dense"
                {...params}
              />
            );
          }}
        />
        <DateTimePicker
          minDate={dateState.fromDate.value}
          ampm={false}
          label="To"
          value={dateState.toDate.value}
          inputFormat={'DD-MM-YYYY HH:mm'}
          onChange={onPickerChange('toDate')}
          renderInput={(params) => {
            params.error = !errorObj.toDate.isValid;
            return (
              <TextField
                helperText={!errorObj.toDate.isValid ? errorObj.toDate.reason : undefined}
                onBlur={onInputBlur('toDate')}
                size="small"
                margin="dense"
                {...params}
              />
            );
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
