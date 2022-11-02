import React, { useState, useMemo, useCallback } from 'react';
import { useGetUsersListQuery } from '../../redux/monitoring/monitoringApi';
import { useDebounce, useSkipFirstRenderEffect } from '../../hooks';
import { formatMoney } from '../../utils/helpers';
import TableData from '../../Components/TableData/TableData';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
  Menu,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EmailIcon from '@mui/icons-material/Email';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import commonStyles from '../../styles/commonStyles.scss';

const headCells = [
  {
    id: 'status',
    label: (
      <Tooltip title="Status">
        <ContentPasteIcon size="small" color="action" />
      </Tooltip>
    ),
    cellWidth: '4.5rem',
    alignContent: 'left',
  },
  {
    id: 'email',
    label: 'Email',
    cellWidth: '15rem',
    alignContent: 'left',
    filterableBy: ['text'],
    sortable: true,
  },

  {
    id: 'connectedWallet',
    label: 'Wallet',
    cellWidth: '10rem',
    alignContent: 'center',
    sortable: true,
  },
  {
    id: 'walletBalance',
    label: 'Wallet balance',
    cellWidth: '9rem',
    alignContent: 'center',
    sortable: true,
  },
  {
    id: 'bonusBalance',
    label: 'Bonus balance',
    cellWidth: '9rem',
    alignContent: 'center',
    sortable: true,
  },
  {
    id: 'role',
    label: 'Role',
    cellWidth: '9rem',
    alignContent: 'center',
  },
  {
    id: 'campaignCount',
    label: 'Campaigns',
    cellWidth: '9rem',
    alignContent: 'center',
    sortable: true,
  },
  {
    id: 'siteCount',
    label: 'Sites',
    cellWidth: '7rem',
    alignContent: 'center',
    sortable: true,
  },
  {
    id: 'lastActiveAt',
    label: 'Last activity',
    cellWidth: '8.5rem',
    alignContent: 'center',
    sortable: true,
  },
  {
    id: 'actions',
    label: (
      <Tooltip title="Actions">
        <ManageAccountsIcon size="small" color="action" />
      </Tooltip>
    ),
    cellWidth: '4.5rem',
    alignContent: 'center',
    disableCellSubmenu: true,
    pinToRight: true,
  },
];

export default function UsersList() {
  const [queryConfig, setQueryConfig] = useState({
    limit: 10,
    cursor: null,
    page: 1,
    orderBy: null,
    'filter[query]': null,
    'filter[role]': null,
    'filter[emailConfirmed]': null,
    'filter[adminConfirmed]': null,
  });
  const { data: response, isFetching } = useGetUsersListQuery(queryConfig, { refetchOnMountOrArgChange: true });

  const parseRoles = useCallback(
    (roles) => {
      const isAdmin = roles.includes('admin');
      const isModerator = roles.includes('moderator');
      const isAgency = roles.includes('agency');
      const isAdvertiser = roles.includes('advertiser');
      const isPublisher = roles.includes('publisher');
      if (isAdmin) {
        return 'Admin';
      } else if (isModerator) {
        return 'Moderator';
      } else if (isAgency) {
        return 'Agency';
      } else if (isAdvertiser && isPublisher) {
        return 'Adv / Pub';
      } else if (isAdvertiser) {
        return 'Advertiser';
      } else if (isPublisher) {
        return 'Publisher';
      } else {
        return 'No role';
      }
    },
    [response],
  );

  const parseConnectedWallet = (wallet) => {
    if (!wallet) {
      return null;
    }
    if (wallet.length > 18) {
      return (
        <Tooltip title={wallet}>
          <Typography variant="body1">{wallet.slice(0, 15) + '...'}</Typography>
        </Tooltip>
      );
    }
    return wallet;
  };

  const rows = useMemo(() => {
    const users = response?.data || [];
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      status: (
        <Box className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
          <Tooltip title={user.emailConfirmed ? 'Confirmed email' : 'Unconfirmed email'}>
            <EmailIcon sx={{ fontSize: 14 }} color={user.emailConfirmed ? 'success' : 'error'} />
          </Tooltip>
          <Tooltip title={user.adminConfirmed ? 'Confirmed account' : 'Unconfirmed account'}>
            <CheckBoxIcon sx={{ fontSize: 14 }} color={user.adminConfirmed ? 'success' : 'error'} />
          </Tooltip>
        </Box>
      ),
      connectedWallet: parseConnectedWallet(user.connectedWallet.address),
      walletBalance: formatMoney(user.adsharesWallet.walletBalance, 2) + ' ADS',
      bonusBalance: formatMoney(user.adsharesWallet.bonusBalance, 2) + ' ADS',
      role: parseRoles(user.roles),
      campaignCount: user.campaignCount,
      siteCount: user.siteCount,
      lastActiveAt: user.lastActiveAt && new Date(user.lastActiveAt).toLocaleString(),
      actions: <PositionedMenu id={user.id} />,
    }));
  }, [response]);

  const handleTableChanges = (event) => {
    console.log(event);
    const createOrderByParams = (params) => {
      const entries = Object.entries(params);
      if (!entries.length) {
        return null;
      }
      return entries.map((param) => param.join(':')).join(',');
    };
    setQueryConfig((prevState) => ({
      ...prevState,
      limit: event.rowsPerPage,
      cursor: event.page === 1 ? null : response?.cursor,
      page: event.page,
      orderBy: createOrderByParams(event.orderBy),
      'filter[query]': event.filterBy.query || null,
      'filter[role]': event.filterBy.role || null,
      'filter[emailConfirmed]': JSON.stringify(event.filterBy.emailConfirmed) || null,
      'filter[adminConfirmed]': JSON.stringify(event.filterBy.adminConfirmed) || null,
    }));
  };

  return (
    <Card
      className={`${commonStyles.card}`}
      sx={{
        height: 'calc(100vh - 8rem)',
        maxWidth: 'calc(100vw - 21rem)',
      }}
      width="full"
    >
      <CardHeader title="Users" />
      <CardContent sx={{ height: 'calc(100% - 4rem)' }}>
        <TableData
          headCells={headCells}
          rows={rows}
          onTableChange={handleTableChanges}
          isDataLoading={isFetching}
          multiSort
          paginationParams={{
            limit: queryConfig.limit,
            count: response?.total || 0,
            showFirstButton: true,
            showLastButton: true,
          }}
          defaultFilterBy={queryConfig.filter}
          customFiltersEl={[FilterByEmail, FilterByRole, FilterByStatus]}
        />
      </CardContent>
    </Card>
  );
}

const PositionedMenu = ({ id }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onMenuClick = () => {
    console.log(id);
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <MoreVertIcon size="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={onMenuClick}>Profile</MenuItem>
        <MenuItem onClick={handleClose}>My account</MenuItem>
        <MenuItem onClick={handleClose}>Logout</MenuItem>
      </Menu>
    </>
  );
};

const FilterByEmail = ({ customFiltersHandler, filterBy }) => {
  const [query, setQuery] = useState(filterBy.query || '');
  const debouncedQuery = useDebounce(query, 500);

  useSkipFirstRenderEffect(() => {
    customFiltersHandler({ query });
  }, [debouncedQuery]);

  return (
    <TextField
      sx={{ mr: 2 }}
      name="query"
      label="Search by email or domain"
      variant="outlined"
      margin="none"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      inputProps={{ autoComplete: 'off' }}
    />
  );
};

const FilterByRole = ({ customFiltersHandler, filterBy }) => {
  return (
    <FormControl>
      <FormLabel focused={false}>Filter by user's role:</FormLabel>
      <RadioGroup
        row
        value={filterBy.role || 'all'}
        onChange={(e) => customFiltersHandler(e.target.value === 'all' ? { role: null } : { role: e.target.value })}
      >
        <FormControlLabel value="advertiser" control={<Radio />} label="Advertiser" />
        <FormControlLabel value="publisher" control={<Radio />} label="Publisher" />
        <FormControlLabel value="all" control={<Radio />} label="All" />
      </RadioGroup>
    </FormControl>
  );
};

const FilterByStatus = ({ customFiltersHandler, filterBy }) => {
  return (
    <FormControl>
      <FormLabel focused={false}>Filter by status:</FormLabel>
      <FormGroup aria-label="position" row>
        <FormControlLabel
          control={
            <Checkbox
              checked={filterBy.hasOwnProperty('emailConfirmed') && filterBy.emailConfirmed}
              onChange={() => customFiltersHandler({ emailConfirmed: !filterBy.emailConfirmed })}
            />
          }
          label="Confirmed email"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={filterBy.hasOwnProperty('adminConfirmed') && filterBy.adminConfirmed}
              onChange={() => customFiltersHandler({ adminConfirmed: !filterBy.adminConfirmed })}
            />
          }
          label="Confirmed account"
        />
        <FormControlLabel
          control={
            <Checkbox
              disabled={!(filterBy.hasOwnProperty('adminConfirmed') || filterBy.hasOwnProperty('emailConfirmed'))}
              checked={!(filterBy.hasOwnProperty('adminConfirmed') || filterBy.hasOwnProperty('emailConfirmed'))}
              onChange={() => customFiltersHandler({ adminConfirmed: null, emailConfirmed: null })}
            />
          }
          label="All"
        />
      </FormGroup>
    </FormControl>
  );
};
