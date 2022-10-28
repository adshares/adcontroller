import React, { useState, useMemo, useCallback } from 'react';
import { useGetUsersListQuery } from '../../redux/monitoring/monitoringApi';
import TableData from '../../Components/TableData/TableData';
import { formatMoney } from '../../utils/helpers';
import { Box, Card, CardContent, CardHeader, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
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
    cellWidth: '7rem',
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
    setQueryConfig((prevState) => ({
      ...prevState,
      limit: event.rowsPerPage,
      cursor: response?.cursor || null,
      page: event.page,
      orderBy: event.orderBy || null,
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
          // defaultSortBy="email"
          paginationParams={{
            limit: queryConfig.limit,
            count: response?.total || 0,
            showFirstButton: true,
            showLastButton: true,
          }}
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
