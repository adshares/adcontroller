import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import commonStyles from '../commonStyles.scss';
import styles from './styles.scss';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';

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

const sortByModel = (model) => (a, b) => {
  let ai = model.indexOf(a.id);
  let bi = model.indexOf(b.id);
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

const FilteringInformationBox = ({ headCells, filterBy, setFilterBy, onRequestFilter }) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleDelete = (property) => {
    setFilterBy((prevState) => {
      const filtersPhrases = {
        ...prevState,
      };
      delete filtersPhrases[property];
      return filtersPhrases;
    });
  };

  const createFilterHandler = (event) => {
    onRequestFilter(event, 'all');
  };

  const chips = Object.keys(filterBy)
    .map((filterName) => {
      const head = headCells.find((el) => el.id === filterName);
      return (
        head && (
          <ListItem sx={{ display: 'inline' }} key={filterName}>
            <Chip onDelete={() => handleDelete(filterName)} label={`${head.label}: ${filterBy[filterName]}`} />
          </ListItem>
        )
      );
    })
    .filter(Boolean);

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
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton type="button" onClick={() => console.log('X click')}>
                    <CloseIcon color="error" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            inputProps={{ autoComplete: 'off' }}
          />
        </Collapse>
      </Box>
      <Collapse in={chips.length > 0} timeout="auto">
        <List>{chips}</List>
      </Collapse>
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
        {cellOptions.filterable && (
          <MenuItem onClick={() => onMenuItemClick(cellOptions.id, 'columnFilter', handleClose)}>
            <FilterListIcon />
            <Typography sx={{ pl: 1 }} variant="body1">
              Filter column
            </Typography>
          </MenuItem>
        )}

        <Divider />
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
  order,
  orderBy,
  onRequestSort,
  filterBy,
  onRequestFilter,
  headCells,
  onPinToLeftColumnRequest,
  onUnpinColumnRequest,
  pinnedToLeft,
}) => {
  const { columnsPinnedToLeftIds, columnsPinnedToLeftWidth } = pinnedToLeft;
  const [showFilteredField, setShowFilteredField] = useState(headCells.reduce((acc, head) => ({ ...acc, [head.id]: false }), {}));
  const [showColumnSubmenu, setShowColumnSubmenu] = useState(null);

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const createFilterHandler = (property) => (event) => {
    onRequestFilter(event, property);
  };

  const toggleShowFiltered = (prop) => {
    setShowFilteredField((prevState) => ({ ...prevState, [prop]: !prevState[prop] }));
  };

  const handleMenuItemClick = (column, option, closeSubmenu) => {
    switch (option) {
      case 'columnFilter':
        toggleShowFiltered(column);
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
    <TableHead>
      <TableRow>
        {headCells.map((headCell, index) => {
          return (
            <TableCell
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
              <Collapse in={!showFilteredField[headCell.id]}>
                <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
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
              </Collapse>

              <Collapse
                addEndListener={(node) => {
                  if (showFilteredField[headCell.id]) {
                    node.querySelector('input').focus();
                  }
                }}
                in={showFilteredField[headCell.id]}
              >
                <TextField
                  inputRef={(input) => {
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
                  onBlur={() => toggleShowFiltered(headCell.id)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FilterListIcon />
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{ autoComplete: 'off' }}
                />
              </Collapse>
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
};

export default function TableData({ defaultSortBy, headCells, rows, onTableChange, isDataLoading }) {
  const [columns] = useState([...headCells]);
  const firstColumnPosition = headCells.map((cell) => cell.id);
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

  const filteredRows = useMemo(() => multiFilterFn(rows, filterBy), [filterBy]);

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

  const columnsPinnedToLeftWidth = useMemo(
    () =>
      columnsPinnedToLeftIds.reduce((acc, val, idx) => {
        const prevCellWidth = parseFloat(columns.find((cell) => cell.id === columnsPinnedToLeftIds[idx - 1])?.cellWidth || 0);
        return { ...acc, [val]: prevCellWidth + acc[columnsPinnedToLeftIds[idx - 1]] || 0 };
      }, {}),
    [columnsPinnedToLeftIds],
  );

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

  const handlePinToLeft = (columnId) => {
    setColumnsPinnedToLeftIds((prevState) => [...prevState, columnId].filter((value, index, self) => self.indexOf(value) === index));
  };

  const handleUnpinColumn = (columnId) => {
    setColumnsPinnedToLeftIds((prevState) => prevState.filter((cell) => cell !== columnId));
  };

  return (
    <Box sx={{ height: '100%' }} className={`${commonStyles.flex} ${commonStyles.flexColumn}`}>
      <FilteringInformationBox onRequestFilter={handleRequestFilter} headCells={columns} filterBy={filterBy} setFilterBy={setFilterBy} />
      <TableContainer>
        <Table stickyHeader padding="none">
          <EnhancedTableHead
            headCells={columns}
            order={order}
            orderBy={orderBy}
            filterBy={filterBy}
            onRequestSort={handleRequestSort}
            onRequestFilter={handleRequestFilter}
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
                        .sort(sortByModel(firstColumnPosition))
                        .sort(sortByModel(columnsPinnedToLeftIds))
                        .map((cell, index) => (
                          <TableCell
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
                        ))}
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
