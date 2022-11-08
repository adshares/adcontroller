import React, { useEffect, useState } from 'react';
import { Box, Button, Collapse, Table, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material';
import apiService from '../../../utils/apiService';
import InstallerStepWrapper from '../../../Components/InstallerStepWrapper/InstallerStepWrapper';
import styles from './styles.scss';
import { useForm, useSkipFirstRenderEffect } from '../../../hooks';
import Spinner from '../../../Components/Spinner/Spinner';
import { validateAddress } from '@adshares/ads';
import useCreateNotification from '../../../hooks/useCreateNotification';

function Wallet({ handleNextStep, handlePrevStep, step }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isHostVerification, setIsHostVerification] = useState(false);
  const walletForm = useForm({
    initialFields: { WalletAddress: '', WalletSecretKey: '' },
    validation: {
      WalletAddress: ['required', 'ADSWallet'],
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
  const [editMode, setEditMode] = useState(false);
  const [dataRequired, setDataRequired] = useState(false);
  const [isKnownNode, setKnownNode] = useState(false);
  const { createErrorNotification } = useCreateNotification();

  useEffect(() => {
    getStepData();
  }, []);

  useSkipFirstRenderEffect(() => {
    if (walletForm.errorObj.WalletAddress.isValid) {
      getWalletNodes();
    }
  }, [walletForm.errorObj.WalletAddress.isValid]);

  useEffect(() => {
    checkIsKnownNode(walletForm.fields.WalletAddress);
  }, [walletForm.fields.WalletAddress]);

  const getStepData = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCurrentStepData(step.path);
      walletForm.setFields({ ...walletForm.fields, ...response });
      setEditMode(response.DataRequired);
      setDataRequired(response.DataRequired);
      if (response.WalletNodeHost) {
        nodeForm.setFields({
          WalletNodeHost: response.WalletNodeHost,
          WalletNodePort: response.WalletNodePort,
        });
      }
    } catch (err) {
      createErrorNotification(err);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      if (!editMode) {
        handleNextStep(step);
        return;
      }
      const body = {
        WalletAddress: walletForm.fields.WalletAddress,
        WalletSecretKey: walletForm.fields.WalletSecretKey,
        WalletNodeHost: nodeForm.fields.WalletNodeHost,
        WalletNodePort: Number(nodeForm.fields.WalletNodePort),
      };
      await apiService.sendStepData(step.path, body);
      handleNextStep(step);
    } catch (err) {
      createErrorNotification(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <InstallerStepWrapper
      dataLoading={isLoading}
      title="Wallet information"
      onNextClick={handleSubmit}
      disabledNext={
        editMode ? !walletForm.isFormValid || !nodeForm.isFormValid || isHostVerification || nodeForm.fields.code === 422 : isLoading
      }
      onBackClick={() => handlePrevStep(step)}
    >
      <Typography variant="body1" paragraph align="center">
        The wallet is used to store users' deposits and earnings. The total profit of the adserver will be deposited in this account. To
        create a new wallet{' '}
        <a href="https://adshares.net/wallet" target="_blank">
          follow the instructions
        </a>
        .
      </Typography>
      <Box className={styles.editButtonThumb}>
        <Button className={dataRequired ? styles.hidden : styles.visible} onClick={() => setEditMode(!editMode)} type="button">
          {editMode ? 'Cancel' : 'Edit'}
        </Button>
      </Box>
      {editMode && (
        <Box className={styles.container}>
          <Box
            component="form"
            className={styles.formBlock}
            onChange={walletForm.onChange}
            onFocus={walletForm.setTouched}
            onSubmit={(e) => e.preventDefault()}
          >
            <TextField
              className={styles.textField}
              error={walletForm.touchedFields.WalletAddress && !walletForm.errorObj.WalletAddress.isValid}
              helperText={walletForm.touchedFields.WalletAddress && walletForm.errorObj.WalletAddress.helperText}
              value={walletForm.fields.WalletAddress}
              margin="dense"
              size="small"
              name="WalletAddress"
              label="ADS account address"
              type="text"
              inputProps={{ autoComplete: 'off' }}
              required
            />
            <TextField
              error={walletForm.touchedFields.WalletSecretKey && !walletForm.errorObj.WalletSecretKey.isValid}
              helperText={walletForm.touchedFields.WalletSecretKey && walletForm.errorObj.WalletSecretKey.helperText}
              value={walletForm.fields.WalletSecretKey}
              margin="dense"
              size="small"
              name="WalletSecretKey"
              label="ADS account secret key"
              type="text"
              inputProps={{ autoComplete: 'off' }}
              required
            />
          </Box>

          <Box
            component="form"
            className={styles.formBlock}
            onFocus={nodeForm.setTouched}
            onChange={nodeForm.onChange}
            onSubmit={(e) => e.preventDefault()}
          >
            <Collapse
              in={Object.values(nodeForm.fields).some((el) => !!el) && !isKnownNode && walletForm.errorObj.WalletAddress.isValid}
              timeout="auto"
              unmountOnExit
            >
              {isHostVerification ? (
                <Spinner />
              ) : (
                <>
                  <TextField
                    className={styles.textField}
                    error={nodeForm.touchedFields.WalletNodeHost && !nodeForm.errorObj.WalletNodeHost.isValid}
                    helperText={nodeForm.touchedFields.WalletNodeHost && nodeForm.errorObj.WalletNodeHost.helperText}
                    value={nodeForm.fields.WalletNodeHost}
                    disabled={!!nodeForm.fields.code}
                    margin="dense"
                    size="small"
                    name="WalletNodeHost"
                    label="Wallet node host"
                    fullWidth
                    inputProps={{ autoComplete: 'off' }}
                  />
                  <TextField
                    className={styles.textField}
                    error={nodeForm.touchedFields.WalletNodePort && !nodeForm.errorObj.WalletNodePort.isValid}
                    helperText={nodeForm.touchedFields.WalletNodePort && nodeForm.errorObj.WalletNodePort.helperText}
                    value={nodeForm.fields.WalletNodePort}
                    disabled={!!nodeForm.fields.code}
                    margin="dense"
                    size="small"
                    name="WalletNodePort"
                    label="Wallet node port"
                    fullWidth
                    inputProps={{ autoComplete: 'off' }}
                  />
                </>
              )}
            </Collapse>
          </Box>
        </Box>
      )}

      {!editMode && (
        <Table>
          <TableBody>
            <TableRow>
              <TableCell align="center">ADS account address</TableCell>
              <TableCell align="center">{walletForm.fields.WalletAddress}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </InstallerStepWrapper>
  );
}

export default Wallet;
