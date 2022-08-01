import React, { useEffect, useState } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableRow, TextField } from '@mui/material';
import apiService from '../../../utils/apiService';
import styles from './styles.scss';
import InstallerStepWrapper from '../../../Components/InstallerStepWrapper/InstallerStepWrapper';
import { useForm } from '../../../hooks';

const SMTP = ({ handleNextStep, handlePrevStep, step }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { fields, isFormValid, errorObj, onFormChange, setFields, validate } = useForm({
    SmtpHost: '',
    SmtpPort: '',
    SmtpSender: '',
    SmtpUsername: '',
  });
  const { fields: newPassword, onFormChange: onPasswordChange } = useForm({ SmtpPassword: '' });
  const [isDataRequired, setIsDataRequired] = useState(true);
  const [editMode, setEditMode] = useState(isDataRequired);
  const [alert, setAlert] = useState({ type: 'error', message: '', title: '' });
  const [isFormWasTouched, setFormTouched] = useState(false);
  const [isEmptyPassword, setIsEmptyPassword] = useState(false);
  const [isPasswordWasTouched, setPasswordTouched] = useState(false);
  useEffect(() => {
    getStepData();
  }, []);

  const getStepData = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCurrentStepData(step.path);
      setIsDataRequired(response.DataRequired);
      setEditMode(response.DataRequired);
      setFields({
        SmtpHost: response.SmtpHost,
        SmtpPort: response.SmtpPort,
        SmtpSender: response.SmtpSender,
        SmtpUsername: response.SmtpUsername,
      });
      setIsEmptyPassword(!response.SmtpPassword.length);
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

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      if (!editMode) {
        handleNextStep(step);
        return;
      }
      if (!isFormValid) {
        return;
      }
      if (isFormWasTouched || isPasswordWasTouched) {
        isPasswordWasTouched
          ? await apiService.sendStepData(step.path, { ...fields, ...newPassword })
          : await apiService.sendStepData(step.path, { ...fields, ...(isDataRequired ? newPassword : {}) });
      }
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
      title="SMTP information"
      onNextClick={handleSubmit}
      disabledNext={!isFormValid}
      onBackClick={() => handlePrevStep(step)}
    >
      {editMode && (
        <>
          {!isDataRequired && (
            <Box className={styles.editButtonThumb}>
              <Button onClick={() => setEditMode(false)} type="button">
                Cancel
              </Button>
            </Box>
          )}
          <Box className={styles.container}>
            <Box
              className={styles.formBlock}
              component="form"
              onChange={onFormChange}
              onBlur={(e) => validate(e.target)}
              onClick={() => setFormTouched(true)}
              onSubmit={(e) => e.preventDefault()}
            >
              <TextField
                className={styles.textField}
                error={!!errorObj.SmtpHost}
                helperText={errorObj.SmtpHost}
                name="SmtpHost"
                value={fields.SmtpHost}
                label="SMTP host"
                size="small"
                type="text"
                fullWidth
                inputProps={{ autoComplete: 'off' }}
              />
              <TextField
                className={styles.textField}
                error={!!errorObj.SmtpPort}
                helperText={errorObj.SmtpPort}
                name="SmtpPort"
                value={fields.SmtpPort}
                label="SMTP port"
                size="small"
                type="text"
                fullWidth
                inputProps={{ autoComplete: 'off' }}
              />
              <TextField
                className={styles.textField}
                error={!!errorObj.SmtpSender}
                helperText={errorObj.SmtpSender}
                name="SmtpSender"
                value={fields.SmtpSender}
                label="SMTP sender"
                size="small"
                type="text"
                fullWidth
                inputProps={{ autoComplete: 'off' }}
              />
              <TextField
                className={styles.textField}
                error={!!errorObj.SmtpUsername}
                helperText={errorObj.SmtpUsername}
                name="SmtpUsername"
                value={fields.SmtpUsername}
                label="SMTP username"
                size="small"
                type="text"
                fullWidth
                inputProps={{ autoComplete: 'off' }}
              />
            </Box>
            <Box
              className={styles.formBlock}
              component="form"
              onChange={(e) => {
                onPasswordChange(e);
                if (!e.target.value.includes('↹')) {
                  setPasswordTouched(true);
                }
              }}
              onSubmit={(e) => e.preventDefault()}
            >
              <TextField
                className={styles.textField}
                value={editMode && isDataRequired ? newPassword.SmtpPassword : undefined}
                defaultValue={editMode && !isDataRequired && !isEmptyPassword ? '↹↹↹↹↹↹↹↹' : undefined}
                name="SmtpPassword"
                size="small"
                label="New password"
                type="password"
                fullWidth
                inputProps={{ autoComplete: 'off' }}
              />
            </Box>
          </Box>
        </>
      )}

      {!editMode && (
        <>
          <Box className={styles.editButtonThumb}>
            <Button onClick={() => setEditMode(true)} type="button">
              Edit
            </Button>
          </Box>
          <InfoTable stepData={fields} />
        </>
      )}
    </InstallerStepWrapper>
  );
};

export default SMTP;

const InfoTable = ({ stepData }) => (
  <Table>
    <TableBody>
      <TableRow>
        <TableCell align="left">SMTP host</TableCell>
        <TableCell align="left">{stepData.SmtpHost}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell align="left">SMTP port</TableCell>
        <TableCell align="left">{stepData.SmtpPort}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell align="left">SMTP sender</TableCell>
        <TableCell align="left">{stepData.SmtpSender}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell align="left">SMTP username</TableCell>
        <TableCell align="left">{stepData.SmtpUsername}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);
