import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import authSelectors from '../../redux/auth/authSelectors';
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
  useSwitchToAdminMutation,
  useSwitchToAgencyMutation,
  useSwitchToModeratorMutation,
  useSwitchToRegularMutation,
  useUnbanUserMutation,
} from '../../redux/monitoring/monitoringApi';
import { updateUserDataReducer } from '../../redux/monitoring/monitoringSlice';
import { useDebounce, useForm, useSkipFirstRenderEffect } from '../../hooks';
import { compareArrays, filterObjectByKeys, formatMoney } from '../../utils/helpers';
import queryString from 'query-string';
import TableData from '../../Components/TableData/TableData';
import FormattedWalletAddress from '../../Components/FormatedWalletAddress/FormattedWalletAddress';
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
import InfoIcon from '@mui/icons-material/Info';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { Role } from '../../Enum/Roles';
import commonStyles from '../../styles/commonStyles.scss';

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
    cellWidth: '10.5rem',
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

const PAGE = 'page';
const LIMIT = 'limit';
const ORDER_BY = 'orderBy';
const FILTER_QUERY = 'filter[query]';
const FILTER_ROLE = 'filter[role]';
const FILTER_EMAIL_CONFIRMED = 'filter[emailConfirmed]';
const FILTER_ADMIN_CONFIRMED = 'filter[adminConfirmed]';
const tableQueryParams = [PAGE, LIMIT, ORDER_BY];
const customFilterQueryParams = [FILTER_QUERY, FILTER_ROLE, FILTER_EMAIL_CONFIRMED, FILTER_ADMIN_CONFIRMED];
const possibleQueryParams = [...tableQueryParams, ...customFilterQueryParams];

export default function UsersList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [queryConfig, setQueryConfig] = useState(() => ({
    page: 1,
    limit: 20,
    cursor: null,
    orderBy: null,
    ...filterObjectByKeys(
      queryString.parse(searchParams.toString(), {
        parseBooleans: true,
      }),
      possibleQueryParams,
    ),
  }));
  const { isFetching, refetch } = useGetUsersListQuery(queryConfig, { refetchOnMountOrArgChange: true });
  const currentUser = useSelector(authSelectors.getUser);
  const users = useSelector(monitoringSelectors.getUsers);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);

  useEffect(() => {
    setSearchParams(queryString.stringify(queryConfig, { skipNull: true }));
  }, [queryConfig]);

  useEffect(() => {
    if (!users) {
      return;
    }
    if (queryConfig.page > users.meta.lastPage) {
      setQueryConfig((prevState) => ({ ...prevState, page: users.meta.lastPage }));
    }
  }, [users]);

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
    setQueryConfig({
      cursor: event.page === 1 ? null : users?.meta.cursor,
      limit: event.rowsPerPage,
      page: event.page,
      orderBy: createOrderByParams(event.orderBy),
      ...event.customFilters,
    });
  };

  const parseRoles = useCallback(
    (roles) => {
      const isAdmin = roles.includes(Role.ADMIN);
      const isModerator = roles.includes(Role.MODERATOR);
      const isAgency = roles.includes(Role.AGENCY);
      const isAdvertiser = roles.includes(Role.ADVERTISER);
      const isPublisher = roles.includes(Role.PUBLISHER);
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
          connectedWallet: <FormattedWalletAddress wallet={user.connectedWallet.address} sx={{ fontFamily: 'Monospace' }} />,
          walletBalance: formatMoney(user.adsharesWallet.walletBalance, 2) + ' ADS',
          bonusBalance: formatMoney(user.adsharesWallet.bonusBalance, 2) + ' ADS',
          role: parseRoles(user.roles),
          campaignCount: user.campaignCount,
          siteCount: user.siteCount,
          lastActiveAt: user.lastActiveAt && new Date(user.lastActiveAt).toLocaleString(),
          actions: <UserActionsMenu currentUser={currentUser} user={user} actions={{ refetch }} />,
        }))
      : [];
  }, [users]);
  return (
    <>
      <Card width="full">
        <Box className={`${commonStyles.flex} ${commonStyles.alignCenter} ${commonStyles.justifySpaceBetween}`}>
          <CardHeader title="Users" />
          <Button
            onClick={() => setAddUserDialogOpen((prevState) => !prevState)}
            variant="contained"
            sx={{ mr: 2 }}
            startIcon={<PersonAddOutlinedIcon />}
          >
            Add user
          </Button>
        </Box>
        <CardContent>
          <TableData
            headCells={headCells}
            rows={rows}
            onTableChange={handleTableChanges}
            isDataLoading={isFetching}
            multiSort
            paginationParams={{
              page: (queryConfig[PAGE] > users?.meta.lastPage ? users?.meta.lastPage : users?.meta.currentPage) || queryConfig[PAGE],
              lastPage: users?.meta.lastPage || 1,
              rowsPerPage: queryConfig[LIMIT] || 20,
              count: users?.meta.total || 0,
              showFirstButton: true,
              showLastButton: true,
            }}
            defaultParams={{
              customFilters: filterObjectByKeys(queryConfig, customFilterQueryParams),
              orderBy: queryConfig[ORDER_BY] && Object.fromEntries(queryConfig[ORDER_BY].split(',').map((entry) => entry.split(':'))),
            }}
            customFiltersEl={[FilterByEmail, FilterByRole, FilterByEmailStatus, FilterByAccountStatus]}
          />
        </CardContent>
      </Card>
      <UserDialog mode="add" open={addUserDialogOpen} setOpen={setAddUserDialogOpen} actions={{ refetch: refetchWithoutCursor }} />
    </>
  );
}

const UserActionsMenu = ({ currentUser, user, actions }) => {
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
  const [switchToAdmin, { isLoading: switchToAdminPending }] = useSwitchToAdminMutation();
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
  const isAdmin = user.roles.includes(Role.ADMIN);
  const isModerator = user.roles.includes(Role.MODERATOR);
  const isAgency = user.roles.includes(Role.AGENCY);
  const isAdvertiser = user.roles.includes(Role.ADVERTISER);
  const isPublisher = user.roles.includes(Role.PUBLISHER);
  const isRegularUser = !isAdmin && !isModerator && !isAgency;
  const isSelfRow = currentUser.name === user.email;
  const isSelfAdmin = currentUser.roles.includes(Role.ADMIN);

  const isActionPending = useMemo(() => {
    return (
      confirmUserPending ||
      switchToAdminPending ||
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
    switchToAdminPending,
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

  const handleSwitchToAdmin = async (id) => {
    const response = await switchToAdmin(id);
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
      <IconButton
        color="black"
        disabled={isActionPending || (!isSelfAdmin && !isSelfRow && (isAdmin || isModerator))}
        onClick={handleMenuOpen}
      >
        {isActionPending ? <Spinner size={24} /> : <MoreVertIcon size="small" />}
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
        {isSelfAdmin && isRegularUser && !user.isBanned && (
          <MenuItem
            sx={{ color: 'warning.main' }}
            onClick={() => {
              handleSwitchToAdmin(user.id);
              handleMenuClose();
            }}
          >
            Switch to admin
          </MenuItem>
        )}
        {isSelfAdmin && isRegularUser && !user.isBanned && (
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
        {isRegularUser && !user.isBanned && (
          <MenuItem
            sx={{ color: 'warning.main' }}
            onClick={() => {
              handleSwitchToAgency(user.id);
              handleMenuClose();
            }}
          >
            Switch to agency
          </MenuItem>
        )}
        {!isSelfRow && !isRegularUser && !user.isBanned && (
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
        {isRegularUser && !isAdvertiser && !user.isBanned && (
          <MenuItem
            onClick={() => {
              handleGrantAdvertising(user.id);
              handleMenuClose();
            }}
          >
            Allow advertising
          </MenuItem>
        )}
        {isRegularUser && isAdvertiser && !user.isBanned && (
          <MenuItem
            onClick={() => {
              handleDenyAdvertising(user.id);
              handleMenuClose();
            }}
          >
            Deny advertising
          </MenuItem>
        )}
        {isRegularUser && !isPublisher && !user.isBanned && (
          <MenuItem
            onClick={() => {
              handleGrantPublishing(user.id);
              handleMenuClose();
            }}
          >
            Allow publishing
          </MenuItem>
        )}
        {isRegularUser && isPublisher && !user.isBanned && (
          <MenuItem
            onClick={() => {
              handleDenyPublishing(user.id);
              handleMenuClose();
            }}
          >
            Deny publishing
          </MenuItem>
        )}
        {!user.isBanned && (
          <MenuItem
            onClick={() => {
              setEditUserDialog((prevState) => !prevState);
              handleMenuClose();
            }}
          >
            Edit user
          </MenuItem>
        )}
        {!isSelfRow && !user.isBanned && (
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
        {!isSelfRow && user.isBanned && (
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
        {!isSelfRow && (
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
                <InfoIcon color="secondary" sx={{ fontSize: 20 }} />
              </Tooltip>
            </Box>
            <TextField
              customvariant="highLabel"
              color="secondary"
              multiline
              fullWidth
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
          <DialogTitle>Confirm</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ color: 'success.main' }}>
              Do you want unban user {user.email}?
            </Typography>
            <Typography variant="body1" sx={{ color: 'error.main' }}>
              <Typography component="span" variant="body1" sx={{ fontWeight: 700, mr: 1 }}>
                Reason of ban:
              </Typography>
              {user.banReason}
            </Typography>
          </DialogContent>
          <DialogActions>
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
        <Dialog
          open={deleteUserDialog}
          onClose={() => {
            setDeleteUserDialog((prevState) => !prevState);
            setDeletionConfirmed(false);
          }}
        >
          <DialogTitle component="div">
            <Typography variant="h6">Do you want delete this user?</Typography>
            <Typography variant="body1" sx={{ color: 'grey.600' }}>
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
            <Button variant="outlined" onClick={() => setDeleteUserDialog((prevState) => !prevState)}>
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

  const isModeAdd = useMemo(() => 'add' === mode, [mode]);
  const isRoleWasChanged = useMemo(() => !compareArrays(role.initialState, role.currentState), [role]);

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
      <Dialog fullWidth maxWidth="xs" open={open} onClose={() => onCloseClick()}>
        <DialogTitle>{isModeAdd ? 'Add new user' : `Edit user ${user.email}`}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            customvariant="highLabel"
            color="secondary"
            label="Email"
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
          <FormControl fullWidth customvariant="highLabel" color="secondary">
            <InputLabel id="networkLabel">Network</InputLabel>
            <Select
              labelId="networkLabel"
              id="networkSelect"
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
            customvariant="highLabel"
            color="secondary"
            label="ADS | BSC wallet address"
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
        <DialogTitle>User was {isModeAdd ? 'added' : 'edited'}</DialogTitle>
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
  const [query, setQuery] = useState(customFilters[FILTER_QUERY] || '');
  const debouncedQuery = useDebounce(query, 400);

  useSkipFirstRenderEffect(() => {
    customFiltersHandler({ [FILTER_QUERY]: query });
  }, [debouncedQuery]);

  useSkipFirstRenderEffect(() => {
    if (customFilters[FILTER_QUERY] === query) {
      return;
    }
    setQuery(customFilters[FILTER_QUERY] || '');
  }, [customFilters[FILTER_QUERY]]);

  return (
    <FormControl sx={{ mr: 3, mt: 2 }} customvariant="highLabel">
      <InputLabel id="filterByQueryLabel">By email or domain</InputLabel>
      <OutlinedInput
        color="secondary"
        name={FILTER_QUERY}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        inputProps={{ autoComplete: 'off' }}
      />
    </FormControl>
  );
};

const FilterByRole = ({ customFiltersHandler, customFilters }) => {
  const handleChange = (e) => {
    customFiltersHandler({ [FILTER_ROLE]: e.target.value || null });
  };

  return (
    <FormControl sx={{ minWidth: '10rem', mr: 3, mt: 2 }} customvariant="highLabel">
      <InputLabel id="filterByRoleLabel">By user's role</InputLabel>
      <Select
        color="secondary"
        labelId="filterByRoleLabel"
        id="filterByRoleSelect"
        value={customFilters.hasOwnProperty(FILTER_ROLE) ? customFilters[FILTER_ROLE] : ''}
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
        <MenuItem value={Role.ADMIN}>Admin</MenuItem>
        <MenuItem value={Role.AGENCY}>Agency</MenuItem>
        <MenuItem value={Role.MODERATOR}>Moderator</MenuItem>
        <MenuItem value={Role.ADVERTISER}>Advertiser</MenuItem>
        <MenuItem value={Role.PUBLISHER}>Publisher</MenuItem>
      </Select>
    </FormControl>
  );
};

const FilterByEmailStatus = ({ customFiltersHandler, customFilters }) => {
  const handleChange = (e) => {
    customFiltersHandler({ [FILTER_EMAIL_CONFIRMED]: e.target.value === '' ? null : e.target.value });
  };

  return (
    <FormControl sx={{ minWidth: '13rem', mr: 3, mt: 2 }} customvariant="highLabel">
      <InputLabel id="filterByEmailStatusLabel">By email status</InputLabel>
      <Select
        color="secondary"
        labelId="filterByEmailStatusLabel"
        id="filterByEmailStatusSelect"
        value={customFilters.hasOwnProperty(FILTER_EMAIL_CONFIRMED) ? customFilters[FILTER_EMAIL_CONFIRMED] : ''}
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
    customFiltersHandler({ [FILTER_ADMIN_CONFIRMED]: e.target.value === '' ? null : e.target.value });
  };

  return (
    <FormControl sx={{ minWidth: '14.5rem', mr: 3, mt: 2 }} customvariant="highLabel">
      <InputLabel id="filterByAccountStatusLabel">By account status</InputLabel>
      <Select
        color="secondary"
        labelId="filterByAccountStatusLabel"
        id="filterByEmailStatusSelect"
        value={customFilters.hasOwnProperty(FILTER_ADMIN_CONFIRMED) ? customFilters[FILTER_ADMIN_CONFIRMED] : ''}
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
