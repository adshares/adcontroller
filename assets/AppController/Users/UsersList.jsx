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
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
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
          <Tooltip title={user.emailConfirmed ? 'Email confirmed' : 'Email unconfirmed'}>
            <EmailIcon sx={{ fontSize: 14 }} color={user.emailConfirmed ? 'success' : 'error'} />
          </Tooltip>
          <Tooltip title={user.adminConfirmed ? 'Account confirmed' : 'Account unconfirmed'}>
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
      'filter[query]': event.customFilters.query || null,
      'filter[role]': event.customFilters.role || null,
      'filter[emailConfirmed]': JSON.stringify(event.customFilters.emailConfirmed) || null,
      'filter[adminConfirmed]': JSON.stringify(event.customFilters.adminConfirmed) || null,
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
          customFiltersEl={[FilterByEmail, FilterByRole, FilterByEmailStatus, FilterByAccountStatus]}
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

const FilterByEmail = ({ customFiltersHandler, customFilters }) => {
  const [query, setQuery] = useState(customFilters.query || '');
  const debouncedQuery = useDebounce(query, 400);

  useSkipFirstRenderEffect(() => {
    customFiltersHandler({ query });
  }, [debouncedQuery]);

  useSkipFirstRenderEffect(() => {
    if (customFilters.query === query) {
      return;
    }
    setQuery(customFilters.query || '');
  }, [customFilters.query]);

  return (
    <TextField
      size="small"
      sx={{ mr: 2 }}
      margin="dense"
      name="query"
      label="By email or domain"
      variant="outlined"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      inputProps={{ autoComplete: 'off' }}
    />
  );
};

const FilterByRole = ({ customFiltersHandler, customFilters }) => {
  const handleChange = (e) => {
    customFiltersHandler({ role: e.target.value || null });
  };

  return (
    <FormControl size="small" sx={{ minWidth: '9rem', mr: 2 }} margin="dense">
      <InputLabel id="filterByRoleLabel">By user's role</InputLabel>
      <Select
        labelId="filterByRoleLabel"
        id="filterByRoleSelect"
        value={customFilters.role || ''}
        label="By user's role"
        onChange={handleChange}
        onClose={(e) => {
          if (!e.target.value) {
            setTimeout(() => {
              document.activeElement.blur();
            }, 0);
          }
        }}
      >
        <MenuItem value="">
          <em>All</em>
        </MenuItem>
        <MenuItem value={'admin'}>Admin</MenuItem>
        <MenuItem value={'agency'}>Agency</MenuItem>
        <MenuItem value={'moderator'}>Moderator</MenuItem>
        <MenuItem value={'advertiser'}>Advertiser</MenuItem>
        <MenuItem value={'publisher'}>Publisher</MenuItem>
      </Select>
    </FormControl>
  );
};

const FilterByEmailStatus = ({ customFiltersHandler, customFilters }) => {
  const handleChange = (e) => {
    customFiltersHandler({ emailConfirmed: e.target.value === '' ? null : e.target.value });
  };

  return (
    <FormControl size="small" sx={{ minWidth: '11.5rem', mr: 2 }} margin="dense">
      <InputLabel id="filterByEmailStatusLabel">By email status</InputLabel>
      <Select
        labelId="filterByEmailStatusLabel"
        id="filterByEmailStatusSelect"
        value={customFilters.hasOwnProperty('emailConfirmed') ? customFilters.emailConfirmed : ''}
        label="By email status"
        onChange={handleChange}
        onClose={(e) => {
          if (!e.target.value) {
            setTimeout(() => {
              document.activeElement.blur();
            }, 0);
          }
        }}
      >
        <MenuItem value="">
          <em>All</em>
        </MenuItem>
        <MenuItem value={true}>Email confirmed</MenuItem>
        <MenuItem value={false}>Email unconfirmed</MenuItem>
      </Select>
    </FormControl>
  );
};

const FilterByAccountStatus = ({ customFiltersHandler, customFilters }) => {
  const handleChange = (e) => {
    customFiltersHandler({ adminConfirmed: e.target.value === '' ? null : e.target.value });
  };

  return (
    <FormControl size="small" sx={{ minWidth: '12.5rem', mr: 2 }} margin="dense">
      <InputLabel id="filterByAccountStatusLabel">By account status</InputLabel>
      <Select
        labelId="filterByAccountStatusLabel"
        id="filterByEmailStatusSelect"
        value={customFilters.hasOwnProperty('adminConfirmed') ? customFilters.adminConfirmed : ''}
        label="By account status"
        onChange={handleChange}
        onClose={(e) => {
          if (!e.target.value) {
            setTimeout(() => {
              document.activeElement.blur();
            }, 0);
          }
        }}
      >
        <MenuItem value="">
          <em>All</em>
        </MenuItem>
        <MenuItem value={true}>Account confirmed</MenuItem>
        <MenuItem value={false}>Account unconfirmed</MenuItem>
      </Select>
    </FormControl>
  );
};
