import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import configSelectors from '../../../redux/config/configSelectors';
import { useSetWalletMutation } from '../../../redux/config/configApi';
import apiService from '../../../utils/apiService';
import { useForm, useSkipFirstRenderEffect, useErrorHandler } from '../../../hooks';
import { validateAddress } from '@adshares/ads';
import Spinner from '../../../Components/Spinner/Spinner';
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
import commonStyles from '../../common/commonStyles.scss';

const WalletSettingsCard = () => {
  const appData = useSelector(configSelectors.getAppData);
  const [editMode, setEditMode] = useState(false);
  const [isHostVerification, setIsHostVerification] = useState(false);
  const [isKnownNode, setKnownNode] = useState(false);
  const { createErrorNotification } = useErrorHandler();
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
  const [setWallet, { isLoading }] = useSetWalletMutation();

  useSkipFirstRenderEffect(() => {
    if (walletForm.errorObj.WalletAddress.isValid) {
      getWalletNodes();
    }
  }, [walletForm.errorObj.WalletAddress.isValid]);

  useEffect(() => {
    checkIsKnownNode(walletForm.fields.WalletAddress);
  }, [walletForm.fields.WalletAddress]);

  const getWalletNodes = async () => {
    try {
      setIsHostVerification(true);
      const response = await apiService.getWalletNodeHost({ WalletAddress: walletForm.fields.WalletAddress });
      nodeForm.setFields({ ...response });
    } catch (err) {
      nodeForm.setFields({
        WalletNodeHost: '',
        WalletNodePort: '',
      });
      createErrorNotification(err);
    } finally {
      setIsHostVerification(false);
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
    try {
      await setWallet({ ...walletForm.fields, ...nodeForm.fields }).unwrap();
    } catch (err) {
      createErrorNotification(err);
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
        <CardHeader title="Wallet settings" />
        <IconButton type="button" onClick={toggleEditMode}>
          {editMode ? <CloseIcon color="error" /> : <EditIcon color="primary" />}
        </IconButton>
      </Box>
      <CardContent>
        <>
          <Collapse in={!editMode} timeout="auto">
            <Box className={`${commonStyles.flex}`}>
              <Typography variant="h6">You wallet address:</Typography>
              <Typography variant="h6" sx={{ ml: 1 }}>
                {appData.AdServer && appData.AdServer.WalletAddress}
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
              {isHostVerification ? (
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
                disabled={isLoading || !walletForm.isFormValid || !nodeForm.isFormValid || isHostVerification}
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
  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Wallet status" />
      <CardContent>
        <Box className={commonStyles.flex}>
          <Typography variant="h6">Total balance:</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, ml: 1 }}>
            {/*TODO: Add service for read wallet balance*/}
            999,999 ADS
          </Typography>
        </Box>
        <Typography variant="body2">
          It is the total balance of all users accounts. It is an amount that should be at least equal to the sum funds stored on hot and
          cold ADS wallets. The amount exceeding this value is operator's profit
        </Typography>
      </CardContent>
      <CardContent>
        <Box className={commonStyles.flex}>
          <Typography variant="h6">Unused bonuses:</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, ml: 1 }}>
            {/*TODO: Add service for read wallet balance*/}
            1,000 ADS
          </Typography>
        </Box>
        <Typography variant="body2">
          It is the total amount of all bonuses that were added to users' accounts but have not been used so far.
        </Typography>
      </CardContent>
    </Card>
  );
};

const ColdWalletSettingsCard = () => {
  const [isEnabled, setEnabled] = useState(true);
  const [minThresholdValue, setMinThresholdValue] = useState('');
  const [maxThresholdValue, setMaxThresholdValue] = useState('');
  const [coldWalletAddress, setColdWalletAddress] = useState('');
  return (
    <Card className={commonStyles.card}>
      <CardHeader title="Cold wallet settings" />
      <FormControlLabel
        sx={{ pl: 2 }}
        label="Enable cold wallet"
        control={<Checkbox checked={isEnabled} onChange={() => setEnabled(!isEnabled)} />}
      />

      <Collapse in={isEnabled} timeout="auto">
        <CardContent>
          <Box className={`${commonStyles.flex} ${commonStyles.justifySpaceAround}`}>
            <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
              <TextField
                size="small"
                name="minThresholdValue"
                label="Min threshold value"
                value={minThresholdValue}
                onChange={(e) => setMinThresholdValue(e.target.value)}
                type="text"
                inputProps={{ autoComplete: 'off' }}
              />
              <Typography sx={{ ml: 1 }} variant="body1">
                ADS
              </Typography>
              <Tooltip
                sx={{ ml: 0.5 }}
                title={
                  // eslint-disable-next-line max-len
                  'Set a minimum amount required to run operations. In case the amount drops below the specified threshold, you will be notified via e-mail'
                }
              >
                <HelpIcon color="primary" />
              </Tooltip>
            </Box>

            <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
              <TextField
                size="small"
                name="maxThresholdValue"
                label="Max threshold value"
                value={maxThresholdValue}
                onChange={(e) => setMaxThresholdValue(e.target.value)}
                type="text"
                inputProps={{ autoComplete: 'off' }}
              />
              <Typography sx={{ ml: 1 }} variant="body1">
                ADS
              </Typography>
              <Tooltip
                sx={{ ml: 0.5 }}
                title={
                  // eslint-disable-next-line max-len
                  'Set a maximum amount that can be stored on a hot wallet. All funds exceeding this amount will be automatically transferred to your cold wallet.'
                }
              >
                <HelpIcon color="primary" />
              </Tooltip>
            </Box>

            <Box className={`${commonStyles.flex} ${commonStyles.alignCenter}`}>
              <TextField
                size="small"
                name="coldWalletAddress"
                label="Cold wallet address"
                value={coldWalletAddress}
                onChange={(e) => setColdWalletAddress(e.target.value)}
                type="text"
                inputProps={{ autoComplete: 'off' }}
              />
              <Tooltip sx={{ ml: 0.5 }} title="Enter your ADS account address">
                <HelpIcon color="primary" />
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Collapse>
      <CardActions>
        <Box className={`${commonStyles.card} ${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
          <Button variant="contained" type="button">
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
      <WalletSettingsCard />
      <WalletStatusCard />
      <ColdWalletSettingsCard />
    </>
  );
}

export default Wallet;
