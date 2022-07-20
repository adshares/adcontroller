import React, { useEffect, useState } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableRow, TextField } from '@mui/material';
import apiService from '../../../utils/apiService';
import styles from './styles.scss';
import InstallerStepWrapper from '../../../Components/InstallerStepWrapper/InstallerStepWrapper';
import { useForm } from '../../../hooks';

const SMTP = ({ handleNextStep, handlePrevStep, step }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { fields, isFormValid, errorObj, onFormChange, setFields, validate } = useForm({
    smtp_host: '',
    smtp_port: '',
    smtp_sender: '',
    smtp_username: '',
  });
  const { fields: newPassword, onFormChange: onPasswordChange } = useForm({ smtp_password: '' });
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
      setIsDataRequired(response.data_required);
      setEditMode(response.data_required);
      setFields({
        smtp_host: response.smtp_host,
        smtp_port: response.smtp_port,
        smtp_sender: response.smtp_sender,
        smtp_username: response.smtp_username,
      });
      setIsEmptyPassword(!response.smtp_password.length);
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
                error={!!errorObj.smtp_host}
                helperText={errorObj.smtp_host}
                name="smtp_host"
                value={fields.smtp_host}
                label="SMTP host"
                size="small"
                type="text"
                fullWidth
              />
              <TextField
                className={styles.textField}
                error={!!errorObj.smtp_port}
                helperText={errorObj.smtp_port}
                name="smtp_port"
                value={fields.smtp_port}
                label="SMTP port"
                size="small"
                type="text"
                fullWidth
              />
              <TextField
                className={styles.textField}
                error={!!errorObj.smtp_sender}
                helperText={errorObj.smtp_sender}
                name="smtp_sender"
                value={fields.smtp_sender}
                label="SMTP sender"
                size="small"
                type="text"
                fullWidth
              />
              <TextField
                className={styles.textField}
                error={!!errorObj.smtp_username}
                helperText={errorObj.smtp_username}
                name="smtp_username"
                value={fields.smtp_username}
                label="SMTP username"
                size="small"
                type="text"
                fullWidth
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
                value={editMode && isDataRequired ? newPassword.smtp_password : undefined}
                defaultValue={editMode && !isDataRequired && !isEmptyPassword ? '↹↹↹↹↹↹↹↹' : undefined}
                name="smtp_password"
                size="small"
                label="New password"
                type="password"
                fullWidth
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
        <TableCell align="left">{stepData.smtp_host}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell align="left">SMTP port</TableCell>
        <TableCell align="left">{stepData.smtp_port}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell align="left">SMTP sender</TableCell>
        <TableCell align="left">{stepData.smtp_sender}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell align="left">SMTP username</TableCell>
        <TableCell align="left">{stepData.smtp_username}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);
