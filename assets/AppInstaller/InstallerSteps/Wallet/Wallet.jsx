import React, { useEffect, useState } from 'react';
import { Box, Button, Collapse, Table, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material';
import apiService from '../../../utils/apiService';
import InstallerStepWrapper from '../../../Components/InstallerStepWrapper/InstallerStepWrapper';
import styles from './styles.scss';
import { useForm, useSkipFirstRenderEffect } from '../../../hooks';
import Spinner from '../../../Components/Spinner/Spinner';

function Wallet({ handleNextStep, handlePrevStep, step }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isHostVerification, setIsHostVerification] = useState(false);
  const { fields, errorObj, setFields, isFormValid, onFormChange, validate } = useForm({
    WalletAddress: '',
    WalletSecretKey: '',
  });
  const {
    fields: nodeHost,
    setFields: setNodeHost,
    errorObj: nodeHostError,
    isFormValid: isNodeHostValid,
    onFormChange: onNodeHostChange,
  } = useForm({
    WalletNodeHost: '',
    WalletNodePort: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [dataRequired, setDataRequired] = useState(false);
  const [alert, setAlert] = useState({
    type: '',
    message: '',
    title: '',
  });
  const [isKnownNode, setKnownNode] = useState(false);

  useEffect(() => {
    getStepData();
  }, []);

  useSkipFirstRenderEffect(() => {
    if (!errorObj.WalletAddress) {
      getWalletNodes();
    }
  }, [errorObj.WalletAddress, fields.WalletAddress]);

  useEffect(() => {
    checkIsKnownNode(fields.WalletAddress);
  }, [fields.WalletAddress]);

  const getStepData = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCurrentStepData(step.path);
      setFields({ ...fields, ...response });
      setEditMode(response.DataRequired);
      setDataRequired(response.DataRequired);
      if (response.WalletNodeHost) {
        setNodeHost({
          WalletNodeHost: response.WalletNodeHost,
          WalletNodePort: response.WalletNodePort,
        });
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.data.message,
        title: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getWalletNodes = async () => {
    try {
      setIsHostVerification(true);
      const response = await apiService.getWalletNodeHost({ WalletAddress: fields.WalletAddress });
      setNodeHost({ ...response });
    } catch (err) {
      setNodeHost({
        WalletNodeHost: '',
        WalletNodePort: '',
      });
      setAlert({
        type: 'error',
        message: err.data.message,
        title: err.message,
      });
    } finally {
      setIsHostVerification(false);
    }
  };

  const checkIsKnownNode = (walletAddress) => {
    const walletAddressRegEx = /^[0-9A-F]{4}-[0-9A-F]{8}-([0-9A-F]{4})$/g;
    if (!walletAddressRegEx.test(walletAddress)) {
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
        WalletAddress: fields.WalletAddress,
        WalletSecretKey: fields.WalletSecretKey,
        WalletNodeHost: nodeHost.WalletNodeHost,
        WalletNodePort: Number(nodeHost.WalletNodePort),
      };
      await apiService.sendStepData(step.path, body);
      handleNextStep(step);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.data.message,
        title: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <InstallerStepWrapper
      alert={alert}
      dataLoading={isLoading}
      title="Wallet information"
      onNextClick={handleSubmit}
      disabledNext={editMode ? !isFormValid || !isNodeHostValid || isHostVerification || nodeHost.code === 422 : isLoading}
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
            onChange={onFormChange}
            onBlur={(e) => validate(e.target)}
            onSubmit={(e) => e.preventDefault()}
          >
            <TextField
              className={styles.textField}
              error={!!errorObj.WalletAddress}
              helperText={errorObj.WalletAddress || ' '}
              value={fields.WalletAddress}
              margin="dense"
              size="small"
              name="WalletAddress"
              label="ADS account address"
              type="text"
              inputProps={{ autoComplete: 'off' }}
              required
            />
            <TextField
              error={!!errorObj.WalletSecretKey}
              helperText={errorObj.WalletSecretKey || ' '}
              value={fields.WalletSecretKey}
              margin="dense"
              size="small"
              name="WalletSecretKey"
              label="ADS account secret key"
              type="text"
              inputProps={{ autoComplete: 'off' }}
              required
            />
          </Box>
          <Collapse
            className={styles.formBlock}
            component="form"
            in={Object.values(nodeHost).some((el) => !!el) && !isKnownNode && !errorObj.WalletAddress}
            timeout="auto"
            unmountOnExit
            onChange={onNodeHostChange}
            onSubmit={(e) => e.preventDefault()}
          >
            {isHostVerification ? (
              <Spinner />
            ) : (
              <>
                <TextField
                  error={!!nodeHostError.WalletNodeHost}
                  helperText={nodeHostError.WalletNodeHost || ' '}
                  value={nodeHost.WalletNodeHost}
                  disabled={!!nodeHost.code}
                  margin="dense"
                  size="small"
                  name="WalletNodeHost"
                  label="Wallet node host"
                  fullWidth
                  inputProps={{ autoComplete: 'off' }}
                />
                <TextField
                  error={!!nodeHostError.WalletNodePort}
                  helperText={nodeHostError.WalletNodePort || ' '}
                  value={nodeHost.WalletNodePort}
                  disabled={!!nodeHost.code}
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
      )}

      {!editMode && (
        <Table>
          <TableBody>
            <TableRow>
              <TableCell align="center">ADS account address</TableCell>
              <TableCell align="center">{fields.WalletAddress}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </InstallerStepWrapper>
  );
}

export default Wallet;
