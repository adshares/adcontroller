import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import configSelectors from '../../redux/config/configSelectors';
import monitoringSelectors from '../../redux/monitoring/monitoringSelectors';
import { useSetWalletConfigMutation, useSetColdWalletConfigMutation, useGetWalletNodeMutation } from '../../redux/config/configApi';
import { useGetWalletMonitoringQuery } from '../../redux/monitoring/monitoringApi';
import { changeColdWalletConfigInformation, changeWalletConfigInformation } from '../../redux/config/configSlice';
import { useForm, useSkipFirstRenderEffect, useCreateNotification } from '../../hooks';
import { adsToClicks, clicksToAds, formatMoney, returnNumber } from '../../utils/helpers';
import { validateAddress } from '@adshares/ads';
import Spinner from '../../Components/Spinner/Spinner';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Collapse,
  FormControlLabel,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import commonStyles from '../../styles/commonStyles.scss';

const WalletSettingsCard = () => {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const [getWalletNode, { isFetching: isNodeVerification }] = useGetWalletNodeMutation();
  const [editMode, setEditMode] = useState(false);
  const [isKnownNode, setKnownNode] = useState(false);
  const { createSuccessNotification } = useCreateNotification();
  const walletForm = useForm({
    initialFields: { WalletAddress: '', WalletSecretKey: '' },
    validation: {
      WalletAddress: ['required', 'wallet'],
      WalletSecretKey: ['required', 'walletSecret'],
    },
  });
  const nodeForm = useForm({
    initialFields: { WalletNodeHost: '', WalletNodePort: '' },
    validation: {
      WalletNodeHost: ['required', 'domain'],
      WalletNodePort: ['required', 'integer'],
    },
  });
  const [setWalletConfig, { isLoading }] = useSetWalletConfigMutation();

  useSkipFirstRenderEffect(() => {
    if (walletForm.errorObj.WalletAddress.isValid) {
      getWalletNodes();
    }
  }, [walletForm.fields.WalletAddress]);

  useEffect(() => {
    checkIsKnownNode(walletForm.fields.WalletAddress);
  }, [walletForm.fields.WalletAddress]);

  const getWalletNodes = async () => {
    const response = await getWalletNode({ WalletAddress: walletForm.fields.WalletAddress });
    if (response.data && response.data.message === 'OK') {
      nodeForm.setFields({ ...response });
    }
    if (response.error) {
      nodeForm.setFields({
        WalletNodeHost: '',
        WalletNodePort: '',
      });
    }
  };

  const checkIsKnownNode = (walletAddress) => {
    const isValidWalletAddress = validateAddress(walletAddress);
    if (!isValidWalletAddress) {
      return;
    }
    const expression = walletAddress.slice(0, 4);
    if (parseInt(expression, 16) > 0 && parseInt(expression, 16) <= 34) {
      setKnownNode(true);
      return;
    }
    setKnownNode(false);
  };

  const onSaveClick = async () => {
    const response = await setWalletConfig({ ...walletForm.fields, ...nodeForm.fields });

    if (response.data && response.data.message === 'OK') {
      dispatch(changeWalletConfigInformation(response.data.data));
      setEditMode((prevState) => !prevState);
      walletForm.resetForm();
      nodeForm.resetForm();
      createSuccessNotification();
    }
  };

  const toggleEditMode = () => {
    if (editMode) {
      walletForm.resetForm();
      nodeForm.resetForm();
    }
    setEditMode(!editMode);
  };

  return (
    <Card className={commonStyles.card}>
      <Box className={`${commonStyles.flex} ${commonStyles.justifySpaceBetween} ${commonStyles.alignBaseline}`}>
        <CardHeader title="Hot wallet" />
        <IconButton type="button" onClick={toggleEditMode}>
          {editMode ? <CloseIcon color="error" /> : <EditIcon color="primary" />}
        </IconButton>
      </Box>
      <CardContent>
        <>
          <Collapse in={!editMode} timeout="auto">
            <Box className={`${commonStyles.flex}`}>
              <Typography variant="h6">Wallet address:</Typography>
              <Typography variant="h6" sx={{ ml: 1 }}>
                {appData.AdServer.WalletAddress}
              </Typography>
            </Box>
          </Collapse>
          <Collapse in={editMode} timeout="auto" unmountOnExit>
            <Box
              sx={{ marginLeft: 'auto', marginRight: 'auto' }}
              className={`${commonStyles.halfCard} ${commonStyles.flex} ${commonStyles.flexColumn}`}
              component="form"
              onChange={walletForm.onChange}
              onFocus={walletForm.setTouched}
            >
              <TextField
                size="small"
                margin="dense"
                name="WalletAddress"
                label="Wallet address"
                error={walletForm.touchedFields.WalletAddress && !walletForm.errorObj.WalletAddress.isValid}
                helperText={walletForm.touchedFields.WalletAddress && walletForm.errorObj.WalletAddress.helperText}
                value={walletForm.fields.WalletAddress}
                type="text"
                inputProps={{ autoComplete: 'off' }}
              />

              <TextField
                size="small"
                margin="dense"
                name="WalletSecretKey"
                label="Secret key"
                error={walletForm.touchedFields.WalletSecretKey && !walletForm.errorObj.WalletSecretKey.isValid}
                helperText={walletForm.touchedFields.WalletSecretKey && walletForm.errorObj.WalletSecretKey.helperText}
                value={walletForm.fields.WalletSecretKey}
                type="text"
                inputProps={{ autoComplete: 'off' }}
              />
            </Box>
            <Collapse
              in={Object.values(nodeForm.fields).some((el) => !!el) && !isKnownNode && walletForm.errorObj.WalletAddress.isValid}
              timeout="auto"
              unmountOnExit
            >
              {isNodeVerification ? (
                <Spinner />
              ) : (
                <Box
                  sx={{ marginLeft: 'auto', marginRight: 'auto' }}
                  className={`${commonStyles.halfCard} ${commonStyles.flex} ${commonStyles.flexColumn}`}
                  component="form"
                  onChange={nodeForm.onChange}
                  onFocus={nodeForm.setTouched}
                >
                  <TextField
                    size="small"
                    margin="dense"
                    name="WalletNodeHost"
                    label="Node host"
                    error={nodeForm.touchedFields.WalletNodeHost && !nodeForm.errorObj.WalletNodeHost.isValid}
                    helperText={nodeForm.touchedFields.WalletNodeHost && nodeForm.errorObj.WalletNodeHost.helperText}
                    value={nodeForm.fields.WalletNodeHost}
                    type="text"
                    inputProps={{ autoComplete: 'off' }}
                  />

                  <TextField
                    size="small"
                    margin="dense"
                    name="WalletNodePort"
                    label="Node port"
                    error={nodeForm.touchedFields.WalletNodePort && !nodeForm.errorObj.WalletNodePort.isValid}
                    helperText={nodeForm.touchedFields.WalletNodePort && nodeForm.errorObj.WalletNodePort.helperText}
                    value={nodeForm.fields.WalletNodePort}
                    type="text"
                    inputProps={{ autoComplete: 'off' }}
                  />
                </Box>
              )}
            </Collapse>
            <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
              <Button
                onClick={onSaveClick}
                disabled={isLoading || !walletForm.isFormValid || !nodeForm.isFormValid || isNodeVerification}
                variant="contained"
                type="button"
              >
                Save
              </Button>
            </Box>
          </Collapse>
        </>
      </CardContent>
    </Card>
  );
};

const WalletStatusCard = () => {
  const monitoringData = useSelector(monitoringSelectors.getMonitoringData);
  useGetWalletMonitoringQuery([], {
    pollingInterval: 3000,
  });

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Ad server balance" />
      <CardContent>
        <Box className={commonStyles.flex}>
          <Typography variant="h6">Total balance:</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, ml: 1 }}>
            {formatMoney(monitoringData.wallet.balance, 5)} ADS
          </Typography>
        </Box>
        <Typography variant="body2">
          Total balance of all user accounts. This amount should be at least equal to the sum of funds accumulated in hot and cold wallets.
          <strong>The amount exceeding this value is the operator's profit</strong>.
        </Typography>
      </CardContent>
      <CardContent>
        <Box className={commonStyles.flex}>
          <Typography variant="h6">Unused bonuses:</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, ml: 1 }}>
            {formatMoney(monitoringData.wallet.unusedBonuses, 5)} ADS
          </Typography>
        </Box>
        <Typography variant="body2">
          The total amount of all bonuses that have been added to user accounts but have not yet been used up.
        </Typography>
      </CardContent>
    </Card>
  );
};

const ColdWalletSettingsCard = () => {
  const appData = useSelector(configSelectors.getAppData);
  const dispatch = useDispatch();
  const [setColdWalletConfig, { isLoading }] = useSetColdWalletConfigMutation();
  const { createSuccessNotification } = useCreateNotification();
  const [ColdWalletIsActive, setColdWalletIsActive] = useState(appData.AdServer.ColdWalletIsActive || false);
  const form = useForm({
    initialFields: {
      HotWalletMinValue: clicksToAds(appData.AdServer.HotWalletMinValue),
      HotWalletMaxValue: clicksToAds(appData.AdServer.HotWalletMaxValue),
      ColdWalletAddress: appData.AdServer.ColdWalletAddress,
    },
    validation: {
      ColdWalletAddress: ['required', 'wallet'],
      HotWalletMinValue: ['number'],
      HotWalletMaxValue: ['number'],
    },
  });

  const onSaveClick = async () => {
    const body = ColdWalletIsActive
      ? {
          ColdWalletIsActive,
          HotWalletMinValue: adsToClicks(returnNumber(form.fields.HotWalletMinValue)),
          HotWalletMaxValue: adsToClicks(returnNumber(form.fields.HotWalletMaxValue)),
          ColdWalletAddress: form.fields.ColdWalletAddress,
        }
      : { ColdWalletIsActive };

    const response = await setColdWalletConfig(body);

    if (response.data && response.data.message === 'OK') {
      dispatch(changeColdWalletConfigInformation(response.data.data));
      createSuccessNotification();
    }
  };

  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Cold wallet" />
      <FormControlLabel
        sx={{ pl: 2 }}
        label="Enable cold wallet"
        control={<Checkbox checked={ColdWalletIsActive} onChange={() => setColdWalletIsActive((prevState) => !prevState)} />}
      />

      <Collapse in={ColdWalletIsActive} timeout="auto">
        <CardContent>
          <Box
            className={`${commonStyles.flex} ${commonStyles.justifySpaceAround} ${commonStyles.alignStart}`}
            component="form"
            onChange={form.onChange}
            onFocus={form.setTouched}
          >
            <Box className={`${commonStyles.flex}`}>
              <TextField
                size="small"
                name="HotWalletMinValue"
                label="Min threshold value"
                error={form.touchedFields.HotWalletMinValue && !form.errorObj.HotWalletMinValue.isValid}
                helperText={form.touchedFields.HotWalletMinValue && form.errorObj.HotWalletMinValue.helperText}
                value={form.fields.HotWalletMinValue}
                type="number"
                inputProps={{ autoComplete: 'off', min: 0 }}
              />
              <Box sx={{ height: '40px', ml: 0.5 }} className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
                <Typography sx={{ ml: 1 }} variant="body1">
                  ADS
                </Typography>
                <Tooltip
                  title={
                    // eslint-disable-next-line max-len
                    'Set a minimum amount required to run operations. In case the amount drops below the specified threshold, you will be notified via e-mail.'
                  }
                >
                  <HelpIcon color="primary" />
                </Tooltip>
              </Box>
            </Box>

            <Box className={`${commonStyles.flex}`}>
              <TextField
                size="small"
                name="HotWalletMaxValue"
                label="Max threshold value"
                error={form.touchedFields.HotWalletMaxValue && !form.errorObj.HotWalletMaxValue.isValid}
                helperText={form.touchedFields.HotWalletMaxValue && form.errorObj.HotWalletMaxValue.helperText}
                value={form.fields.HotWalletMaxValue}
                type="number"
                inputProps={{ autoComplete: 'off', min: 0 }}
              />
              <Box sx={{ height: '40px', ml: 0.5 }} className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
                <Typography sx={{ ml: 1 }} variant="body1">
                  ADS
                </Typography>
                <Tooltip
                  title={
                    // eslint-disable-next-line max-len
                    'Set a maximum amount that can be stored on a hot wallet. All funds exceeding this amount will be automatically transferred to your cold wallet.'
                  }
                >
                  <HelpIcon color="primary" />
                </Tooltip>
              </Box>
            </Box>

            <Box className={`${commonStyles.flex}`}>
              <TextField
                size="small"
                name="ColdWalletAddress"
                label="Cold wallet address"
                error={form.touchedFields.ColdWalletAddress && !form.errorObj.ColdWalletAddress.isValid}
                helperText={form.touchedFields.ColdWalletAddress && form.errorObj.ColdWalletAddress.helperText}
                value={form.fields.ColdWalletAddress}
                type="text"
                inputProps={{ autoComplete: 'off' }}
              />
            </Box>
          </Box>
        </CardContent>
      </Collapse>
      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button
            disabled={
              (appData.AdServer.ColdWalletIsActive === ColdWalletIsActive && !form.isFormWasChanged) || isLoading || !form.isFormValid
            }
            onClick={onSaveClick}
            variant="contained"
            type="button"
          >
            Save
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

function Wallet() {
  return (
    <>
      <WalletStatusCard />
      <WalletSettingsCard />
      <ColdWalletSettingsCard />
    </>
  );
}

export default Wallet;
