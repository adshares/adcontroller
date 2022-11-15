import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import monitoringSelectors from '../../redux/monitoring/monitoringSelectors';
import {
  useAddUserMutation,
  useBanUserMutation,
  useConfirmUserMutation,
  useDeleteUserMutation,
  useDenyAdvertisingMutation,
  useDenyPublishingMutation,
  useEditUserMutation,
  useGetUsersListQuery,
  useGrantAdvertisingMutation,
  useGrantPublishingMutation,
  useSwitchToAgencyMutation,
  useSwitchToModeratorMutation,
  useSwitchToRegularMutation,
  useUnbanUserMutation,
} from '../../redux/monitoring/monitoringApi';
import { updateUserDataReducer } from '../../redux/monitoring/monitoringSlice';
import { useDebounce, useForm, useSkipFirstRenderEffect } from '../../hooks';
import { compareArrays, formatMoney } from '../../utils/helpers';
import TableData from '../../Components/TableData/TableData';
import Spinner from '../../Components/Spinner/Spinner';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HelpIcon from '@mui/icons-material/Help';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import commonStyles from '../../styles/commonStyles.scss';
import ListItemText from '@mui/material/ListItemText';

const headCells = [
  {
    id: 'status',
    label: (
      <Tooltip title="Status">
        <AssignmentTurnedInOutlinedIcon size="small" color="black" />
      </Tooltip>
    ),
    cellWidth: '5rem',
    alignContent: 'left',
  },
  {
    id: 'email',
    label: 'E-mail',
    cellWidth: '18rem',
    alignContent: 'left',
    sortable: true,
  },

  {
    id: 'connectedWallet',
    label: 'Wallet',
    cellWidth: '13rem',
    alignContent: 'left',
    sortable: true,
  },
  {
    id: 'walletBalance',
    label: 'Wallet balance',
    cellWidth: '9rem',
    alignContent: 'left',
    sortable: true,
  },
  {
    id: 'bonusBalance',
    label: 'Bonus balance',
    cellWidth: '9rem',
    alignContent: 'left',
    sortable: true,
  },
  {
    id: 'role',
    label: 'Role',
    cellWidth: '9rem',
    alignContent: 'left',
  },
  {
    id: 'campaignCount',
    label: 'Campaigns',
    cellWidth: '9rem',
    alignContent: 'left',
    sortable: true,
  },
  {
    id: 'siteCount',
    label: 'Sites',
    cellWidth: '7rem',
    alignContent: 'left',
    sortable: true,
  },
  {
    id: 'lastActiveAt',
    label: 'Last activity',
    cellWidth: '8.5rem',
    alignContent: 'left',
    sortable: true,
  },
  {
    id: 'actions',
    label: (
      <Box sx={{ width: '100%' }} className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
        <Tooltip title="Actions">
          <MenuIcon size="small" color="black" />
        </Tooltip>
      </Box>
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
  const users = useSelector(monitoringSelectors.getUsers);
  const { isFetching, refetch } = useGetUsersListQuery(queryConfig, { refetchOnMountOrArgChange: true });
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);

  const refetchWithoutCursor = () => {
    setQueryConfig((prevState) => ({ ...prevState, cursor: null }));
    if (!queryConfig.cursor) {
      refetch();
    }
  };

  const handleTableChanges = (event) => {
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
      cursor: event.page === 1 ? null : users.cursor,
      page: event.page,
      orderBy: createOrderByParams(event.orderBy),
      'filter[query]': event.customFilters.query || null,
      'filter[role]': event.customFilters.role || null,
      'filter[emailConfirmed]': JSON.stringify(event.customFilters.emailConfirmed) || null,
      'filter[adminConfirmed]': JSON.stringify(event.customFilters.adminConfirmed) || null,
    }));
  };

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
    [users],
  );

  const parseConnectedWallet = (wallet) => {
    if (!wallet) {
      return null;
    }
    if (wallet.length > 18) {
      return (
        <Tooltip title={wallet}>
          <Typography variant="body2">{wallet.slice(0, 15) + '...'}</Typography>
        </Tooltip>
      );
    }
    return wallet;
  };

  const rows = useMemo(() => {
    return users
      ? users.data.map((user) => ({
          id: user.id,
          status: (
            <Box className={`${commonStyles.flex} ${commonStyles.flexWrap}`}>
              <Tooltip title={user.emailConfirmed ? 'Email confirmed' : 'Email unconfirmed'}>
                <MailOutlineOutlinedIcon sx={{ fontSize: 14 }} color={user.emailConfirmed ? 'success' : 'error'} />
              </Tooltip>
              <Tooltip title={user.adminConfirmed ? 'Account confirmed' : 'Account unconfirmed'}>
                <CheckBoxOutlinedIcon sx={{ fontSize: 14 }} color={user.adminConfirmed ? 'success' : 'error'} />
              </Tooltip>
              {user.isBanned && (
                <Tooltip title={`Banned user. Reason: ${user.banReason}`}>
                  <CancelOutlinedIcon sx={{ fontSize: 14 }} color="error" />
                </Tooltip>
              )}
            </Box>
          ),
          email: user.email,
          connectedWallet: parseConnectedWallet(user.connectedWallet.address),
          walletBalance: formatMoney(user.adsharesWallet.walletBalance, 2) + ' ADS',
          bonusBalance: formatMoney(user.adsharesWallet.bonusBalance, 2) + ' ADS',
          role: parseRoles(user.roles),
          campaignCount: user.campaignCount,
          siteCount: user.siteCount,
          lastActiveAt: user.lastActiveAt && new Date(user.lastActiveAt).toLocaleString(),
          actions: <UserActionsMenu user={user} actions={{ refetch }} />,
        }))
      : [];
  }, [users]);

  return (
    <>
      <Card
        className={`${commonStyles.card}`}
        sx={{
          height: 'calc(100vh - 9rem)',
        }}
        width="full"
      >
        <Box className={`${commonStyles.flex} ${commonStyles.alignCenter} ${commonStyles.justifySpaceBetween}`}>
          <CardHeader
            titleTypographyProps={{
              component: 'h2',
              variant: 'h2',
            }}
            title="Users"
          />
          <Button
            onClick={() => setAddUserDialogOpen((prevState) => !prevState)}
            variant="contained"
            sx={{ mr: 2 }}
            startIcon={<PersonAddOutlinedIcon />}
          >
            Add user
          </Button>
        </Box>
        <CardContent sx={{ height: 'calc(100% - 4rem)' }}>
          <TableData
            headCells={headCells}
            rows={rows}
            onTableChange={handleTableChanges}
            isDataLoading={isFetching}
            multiSort
            paginationParams={{
              limit: queryConfig.limit,
              count: users?.total || 0,
              showFirstButton: true,
              showLastButton: true,
            }}
            customFiltersEl={[FilterByEmail, FilterByRole, FilterByEmailStatus, FilterByAccountStatus]}
          />
        </CardContent>
      </Card>
      <UserDialog mode="add" open={addUserDialogOpen} setOpen={setAddUserDialogOpen} actions={{ refetch: refetchWithoutCursor }} />
    </>
  );
}

const UserActionsMenu = ({ user, actions }) => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const menuOpen = Boolean(anchorEl);
  const [editUserDialog, setEditUserDialog] = useState(false);
  const [banUserDialog, setBanUserDialog] = useState(false);
  const [unbanUserDialog, setUnbanUserDialog] = useState(false);
  const [deleteUserDialog, setDeleteUserDialog] = useState(false);
  const [deletionConfirmed, setDeletionConfirmed] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [confirmUser, { isLoading: confirmUserPending }] = useConfirmUserMutation();
  const [switchToModerator, { isLoading: switchToModeratorPending }] = useSwitchToModeratorMutation();
  const [switchToAgency, { isLoading: switchToAgencyPending }] = useSwitchToAgencyMutation();
  const [switchToRegular, { isLoading: switchToRegularPending }] = useSwitchToRegularMutation();
  const [denyAdvertising, { isLoading: denyAdvertisingPending }] = useDenyAdvertisingMutation();
  const [grantAdvertising, { isLoading: grantAdvertisingPending }] = useGrantAdvertisingMutation();
  const [denyPublishing, { isLoading: denyPublishingPending }] = useDenyPublishingMutation();
  const [grantPublishing, { isLoading: grantPublishingPending }] = useGrantPublishingMutation();
  const [banUser, { isLoading: banUserPending }] = useBanUserMutation();
  const [unbanUser, { isLoading: unbanUserPending }] = useUnbanUserMutation();
  const [deleteUser, { isLoading: deleteUserPending }] = useDeleteUserMutation();
  const isAdmin = user.roles.includes('admin');
  const isModerator = user.roles.includes('moderator');
  const isAgency = user.roles.includes('agency');
  const isAdvertiser = user.roles.includes('advertiser');
  const isPublisher = user.roles.includes('publisher');

  const isActionPending = useMemo(() => {
    return (
      confirmUserPending ||
      switchToModeratorPending ||
      switchToAgencyPending ||
      switchToRegularPending ||
      denyAdvertisingPending ||
      grantAdvertisingPending ||
      denyPublishingPending ||
      grantPublishingPending ||
      banUserPending ||
      unbanUserPending ||
      deleteUserPending
    );
  }, [
    confirmUserPending,
    switchToModeratorPending,
    switchToAgencyPending,
    switchToRegularPending,
    denyAdvertisingPending,
    grantAdvertisingPending,
    denyPublishingPending,
    grantPublishingPending,
    banUserPending,
    unbanUserPending,
    deleteUserPending,
  ]);

  const handleConfirmUser = async (id) => {
    const response = await confirmUser(id);
    if (response.data && response.data.message === 'OK') {
      dispatch(updateUserDataReducer(response.data));
    }
  };

  const handleSwitchToModerator = async (id) => {
    const response = await switchToModerator(id);
    if (response.data && response.data.message === 'OK') {
      dispatch(updateUserDataReducer(response.data));
    }
  };

  const handleSwitchToAgency = async (id) => {
    const response = await switchToAgency(id);
    if (response.data && response.data.message === 'OK') {
      dispatch(updateUserDataReducer(response.data));
    }
  };

  const handleSwitchToRegular = async (id) => {
    const response = await switchToRegular(id);
    if (response.data && response.data.message === 'OK') {
      dispatch(updateUserDataReducer(response.data));
    }
  };

  const handleDenyAdvertising = async (id) => {
    const response = await denyAdvertising(id);
    if (response.data && response.data.message === 'OK') {
      dispatch(updateUserDataReducer(response.data));
    }
  };

  const handleGrantAdvertising = async (id) => {
    const response = await grantAdvertising(id);
    if (response.data && response.data.message === 'OK') {
      dispatch(updateUserDataReducer(response.data));
    }
  };

  const handleDenyPublishing = async (id) => {
    const response = await denyPublishing(id);
    if (response.data && response.data.message === 'OK') {
      dispatch(updateUserDataReducer(response.data));
    }
  };

  const handleGrantPublishing = async (id) => {
    const response = await grantPublishing(id);
    if (response.data && response.data.message === 'OK') {
      dispatch(updateUserDataReducer(response.data));
    }
  };

  const handleBanUser = async (id) => {
    const response = await banUser({ id, reason: banReason });
    if (response.data && response.data.message === 'OK') {
      dispatch(updateUserDataReducer(response.data));
      setBanReason('');
    }
  };

  const handleUnbanUser = async (id) => {
    const response = await unbanUser(id);
    if (response.data && response.data.message === 'OK') {
      dispatch(updateUserDataReducer(response.data));
    }
  };

  const handleDeleteUser = async (id) => {
    const response = await deleteUser(id);
    if (response.data && response.data.message === 'OK') {
      actions.refetch();
    }
  };

  const handleMenuOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton disabled={isActionPending || isAdmin} onClick={handleMenuOpen}>
        {isActionPending ? <Spinner size={24} /> : <MoreVertIcon size="small" color="black" />}
      </IconButton>
      <Menu
        variant="menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {!user.adminConfirmed && !user.isBanned && (
          <MenuItem
            sx={{ color: 'success.main' }}
            onClick={() => {
              handleConfirmUser(user.id);
              handleMenuClose();
            }}
          >
            Confirm
          </MenuItem>
        )}
        {!isAdmin && !isModerator && !isAgency && !user.isBanned && (
          <MenuItem
            sx={{ color: 'warning.main' }}
            onClick={() => {
              handleSwitchToModerator(user.id);
              handleMenuClose();
            }}
          >
            Switch to moderator
          </MenuItem>
        )}
        {!isAdmin && !isModerator && !isAgency && !user.isBanned && (
          <MenuItem
            onClick={() => {
              handleSwitchToAgency(user.id);
              handleMenuClose();
            }}
          >
            Switch to agency
          </MenuItem>
        )}
        {!isAdmin && (isModerator || isAgency) && !user.isBanned && (
          <MenuItem
            sx={{ color: 'warning.main' }}
            onClick={() => {
              handleSwitchToRegular(user.id);
              handleMenuClose();
            }}
          >
            Switch to regular
          </MenuItem>
        )}
        {!isAdmin && !isAdvertiser && !user.isBanned && (
          <MenuItem
            onClick={() => {
              handleGrantAdvertising(user.id);
              handleMenuClose();
            }}
          >
            Allow advertising
          </MenuItem>
        )}
        {!isAdmin && isAdvertiser && !user.isBanned && (
          <MenuItem
            onClick={() => {
              handleDenyAdvertising(user.id);
              handleMenuClose();
            }}
          >
            Deny advertising
          </MenuItem>
        )}
        {!isAdmin && !isPublisher && !user.isBanned && (
          <MenuItem
            onClick={() => {
              handleGrantPublishing(user.id);
              handleMenuClose();
            }}
          >
            Allow publishing
          </MenuItem>
        )}
        {!isAdmin && isPublisher && !user.isBanned && (
          <MenuItem
            onClick={() => {
              handleDenyPublishing(user.id);
              handleMenuClose();
            }}
          >
            Deny publishing
          </MenuItem>
        )}
        {!isAdmin && !user.isBanned && (
          <MenuItem
            onClick={() => {
              setEditUserDialog((prevState) => !prevState);
              handleMenuClose();
            }}
          >
            Edit user
          </MenuItem>
        )}
        {!isAdmin && !user.isBanned && (
          <MenuItem
            sx={{ color: 'error.main' }}
            onClick={() => {
              setBanUserDialog((prevState) => !prevState);
              handleMenuClose();
            }}
          >
            Ban user
          </MenuItem>
        )}
        {!isAdmin && user.isBanned && (
          <MenuItem
            sx={{ color: 'error.main' }}
            onClick={() => {
              setUnbanUserDialog((prevState) => !prevState);
              handleMenuClose();
            }}
          >
            Unban user
          </MenuItem>
        )}
        {!isAdmin && (
          <MenuItem
            sx={{ color: 'error.main' }}
            onClick={() => {
              setDeleteUserDialog((prevState) => !prevState);
              handleMenuClose();
            }}
          >
            Delete user
          </MenuItem>
        )}
      </Menu>

      {banUserDialog && (
        <Dialog
          fullWidth
          maxWidth="xs"
          open={banUserDialog}
          onClose={() => {
            setBanUserDialog((prevState) => !prevState);
            setBanReason('');
          }}
        >
          <DialogTitle component="div">
            <Typography variant="h6">Do you want ban this user?</Typography>
            <Typography variant="body1" sx={{ color: 'grey.600' }}>
              {user.email}
            </Typography>
          </DialogTitle>
          <DialogContent>
            {user.banReason && (
              <Typography sx={{ mb: 2 }} variant="body2">
                Previous reason: {user.banReason}
              </Typography>
            )}
            <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
              <Typography sx={{ mr: 0.5 }} variant="body2">
                Reason of ban
              </Typography>
              <Tooltip title="Reason will be displayed to the banned user">
                <HelpIcon color="primary" sx={{ fontSize: 20 }} />
              </Tooltip>
            </Box>
            <TextField
              multiline
              fullWidth
              margin="dense"
              label="Reason"
              rows={4}
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => setBanUserDialog((prevState) => !prevState)}>
              Close
            </Button>
            <Button
              disabled={!banReason}
              variant="contained"
              color="error"
              onClick={() => {
                handleBanUser(user.id);
                setBanUserDialog((prevState) => !prevState);
              }}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {unbanUserDialog && (
        <Dialog fullWidth maxWidth="xs" open={unbanUserDialog} onClose={() => setUnbanUserDialog((prevState) => !prevState)}>
          <DialogTitle align="center">Confirm</DialogTitle>
          <DialogContent>
            <Typography align="center" variant="body1" sx={{ color: 'success.main' }}>
              Do you want unban user {user.email}?
            </Typography>
            <Typography align="center" variant="body1" sx={{ color: 'error.main' }}>
              <Typography component="span" variant="body1" sx={{ fontWeight: 700, mr: 1 }}>
                Reason of ban:
              </Typography>
              {user.banReason}
            </Typography>
          </DialogContent>
          <DialogActions className={`${commonStyles.flex} ${commonStyles.justifyCenter}`}>
            <Button variant="outlined" onClick={() => setUnbanUserDialog((prevState) => !prevState)}>
              No
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handleUnbanUser(user.id);
                setUnbanUserDialog((prevState) => !prevState);
              }}
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {deleteUserDialog && (
        <Dialog open={deleteUserDialog} onClose={() => setDeleteUserDialog((prevState) => !prevState)}>
          <DialogTitle component="div">
            <Typography align="center" variant="h6">
              Do you want delete this user?
            </Typography>
            <Typography align="center" variant="body1" sx={{ color: 'grey.600' }}>
              {user.email}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <FormControlLabel
              label="This operation is irreversible! Confirm the deletion"
              control={<Checkbox onChange={() => setDeletionConfirmed((prevState) => !prevState)} />}
            />
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => setBanUserDialog((prevState) => !prevState)}>
              Close
            </Button>
            <Button
              disabled={!deletionConfirmed}
              variant="contained"
              color="error"
              onClick={() => {
                handleDeleteUser(user.id);
                setDeleteUserDialog((prevState) => !prevState);
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {editUserDialog && <UserDialog open={editUserDialog} setOpen={setEditUserDialog} mode="edit" user={user} />}
    </>
  );
};

const UserDialog = ({ open, setOpen, mode, user, actions }) => {
  const possibleRoles = ['moderator', 'agency', 'advertiser', 'publisher'];
  const dispatch = useDispatch();
  const form = useForm({
    initialFields: {
      email: user?.email || '',
      wallet: user?.connectedWallet.address || '',
      network: user?.connectedWallet.network || 'ADS',
    },
    validation: {
      email: ['email'],
      wallet: ['ADSWallet'],
    },
  });
  const [role, setRole] = useState({ initialState: user?.roles || [], currentState: user?.roles || [] });
  const [forcePasswordChange, setForcePasswordChange] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [addUser, { isLoading: addUserPending, data: addUserData }] = useAddUserMutation();
  const [editUser, { isLoading: editUserPending }] = useEditUserMutation();

  useEffect(() => {
    form.changeValidationRules({ wallet: [`${form.fields.network}Wallet`] });
  }, [form.fields.network]);

  const isRoleWasChanged = useMemo(() => !compareArrays(role.initialState, role.currentState), [role]);

  const handleRolePick = (e) => {
    const { value } = e.target;
    setRole((prevState) => ({ ...prevState, currentState: typeof value === 'string' ? value.split(',') : value }));
  };

  const resetForm = () => {
    form.resetForm();
    setRole({ initialState: user?.roles || [], currentState: user?.roles || [] });
  };

  const onConfirmClick = async () => {
    if (!user) {
      const body = {
        email: form.fields.email || null,
        role: role.currentState,
        wallet: form.fields.wallet ? { address: form.fields.wallet, network: form.fields.network } : null,
        forcePasswordChange: form.fields.email ? forcePasswordChange : null,
      };
      const response = await addUser(body);
      if (response.data && response.data.message === 'OK') {
        actions.refetch();
        setOpen(false);
        setInfoDialogOpen(true);
        resetForm();
      }
    }
    if (user) {
      const body = {
        ...(form.changedFields.email ? { email: form.fields.email } : {}),
        ...(form.changedFields.wallet || form.changedFields.network
          ? { wallet: { address: form.fields.wallet, network: form.fields.network } }
          : {}),
        ...(isRoleWasChanged ? { role: role.currentState } : {}),
        ...(forcePasswordChange ? { forcePasswordChange } : {}),
      };
      const response = await editUser({ id: user.id, body });
      if (response.data && response.data.message === 'OK') {
        dispatch(updateUserDataReducer(response.data));
        setOpen(false);
        resetForm();
      }
    }
  };

  const onCloseClick = () => {
    setOpen(false);
    resetForm();
  };

  return (
    <>
      <Dialog fullWidth maxWidth="xs" open={open} onClose={() => setOpen((prevState) => !prevState)}>
        <DialogTitle>{mode === 'add' ? 'Add new user' : `Edit user ${user.email}`}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Email"
            size="small"
            name="email"
            value={form.fields.email}
            onFocus={form.setTouched}
            onChange={form.onChange}
            error={!form.errorObj.email.isValid}
            helperText={form.errorObj.email.helperText}
          />
          <Collapse in={form.fields.email.length > 0}>
            <FormControlLabel
              label="Send link to change password"
              control={<Checkbox checked={forcePasswordChange} onChange={() => setForcePasswordChange((prevState) => !prevState)} />}
            />
          </Collapse>
          <FormControl fullWidth size="small" margin="dense">
            <InputLabel id="rolesPickerLabel">Roles</InputLabel>
            <Select
              labelId="rolesPickerLabel"
              id="rolesPickerSelect"
              multiple
              value={role.currentState}
              onChange={handleRolePick}
              input={<OutlinedInput label="Roles" />}
              renderValue={(selected) => selected.map((el) => el.charAt(0).toUpperCase() + el.slice(1)).join(', ')}
            >
              {possibleRoles.map((el) => (
                <MenuItem key={el} value={el}>
                  <Checkbox checked={role.currentState.indexOf(el) > -1} />
                  <ListItemText primary={el.charAt(0).toUpperCase() + el.slice(1)} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small" margin="dense">
            <InputLabel id="networkLabel">Network</InputLabel>
            <Select
              labelId="networkLabel"
              id="networkSelect"
              label="Network"
              name="network"
              value={form.fields.network}
              onFocus={form.setTouched}
              onChange={form.onChange}
            >
              <MenuItem value="ADS">ADS</MenuItem>
              <MenuItem value="BSC">BSC</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="dense"
            label="ADS | BSC wallet address"
            size="small"
            name={'wallet'}
            value={form.fields.wallet}
            onChange={form.onChange}
            onFocus={form.setTouched}
            error={!form.errorObj.wallet.isValid}
            helperText={form.errorObj.wallet.helperText}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseClick} variant="outlined">
            Close
          </Button>
          <Button
            disabled={
              (form.fields.wallet ? !!form.fields.wallet && !form.fields.network : !form.fields.email) ||
              !(form.isFormWasChanged || isRoleWasChanged) ||
              !form.isFormValid ||
              addUserPending ||
              editUserPending
            }
            onClick={onConfirmClick}
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog fullWidth maxWidth="xs" open={infoDialogOpen}>
        <DialogTitle>User was {mode === 'add' ? 'added' : 'edited'}</DialogTitle>
        <DialogContent>
          {addUserData && addUserData.data.email && <Typography variant="body1">Email: {addUserData.data.email}</Typography>}
          {addUserData && addUserData.data.connectedWallet.address && (
            <Typography variant="body1"> Wallet: {addUserData.data.connectedWallet.address}</Typography>
          )}
          {addUserData && addUserData.data.password && (
            <>
              <Typography variant="body1">Password: {addUserData.data.password}</Typography>
              <Typography variant="body2" sx={{ color: 'error.main' }}>
                Save this password. After closing is not be available.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
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
    <FormControl sx={{ mr: 3 }} customvariant="highLabel">
      <InputLabel id="filterByQueryLabel">By email or domain</InputLabel>
      <OutlinedInput name="query" value={query} onChange={(e) => setQuery(e.target.value)} inputProps={{ autoComplete: 'off' }} />
    </FormControl>
  );
};

const FilterByRole = ({ customFiltersHandler, customFilters }) => {
  const handleChange = (e) => {
    customFiltersHandler({ role: e.target.value || null });
  };

  return (
    <FormControl sx={{ minWidth: '10rem', mr: 3 }} customvariant="highLabel">
      <InputLabel id="filterByRoleLabel">By user's role</InputLabel>
      <Select
        labelId="filterByRoleLabel"
        id="filterByRoleSelect"
        value={customFilters.role || ''}
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
    <FormControl sx={{ minWidth: '13rem', mr: 3 }} customvariant="highLabel">
      <InputLabel id="filterByEmailStatusLabel">By email status</InputLabel>
      <Select
        labelId="filterByEmailStatusLabel"
        id="filterByEmailStatusSelect"
        value={customFilters.hasOwnProperty('emailConfirmed') ? customFilters.emailConfirmed : ''}
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
    <FormControl sx={{ minWidth: '14.5rem', mr: 3 }} customvariant="highLabel">
      <InputLabel id="filterByAccountStatusLabel">By account status</InputLabel>
      <Select
        labelId="filterByAccountStatusLabel"
        id="filterByEmailStatusSelect"
        value={customFilters.hasOwnProperty('adminConfirmed') ? customFilters.adminConfirmed : ''}
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
