import React, { useEffect, useState } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material';
import apiService from '../../../utils/apiService';
import styles from './styles.scss';
import InstallerStepWrapper from '../../../Components/InstallerStepWrapper/InstallerStepWrapper';
import { useForm, useCreateNotification } from '../../../hooks';

const SMTP = ({ handleNextStep, handlePrevStep, step }) => {
  const [isLoading, setIsLoading] = useState(true);
  const smtpForm = useForm({
    initialFields: {
      SmtpHost: '',
      SmtpPort: '',
      SmtpSender: '',
      SmtpUsername: '',
    },
    validation: {
      SmtpHost: ['required', 'domain'],
      SmtpPort: ['required', 'integer'],
      SmtpSender: ['required'],
      SmtpUsername: ['required'],
    },
  });
  const passwordForm = useForm({
    initialFields: { SmtpPassword: '' },
  });
  const [isDataRequired, setIsDataRequired] = useState(true);
  const [editMode, setEditMode] = useState(isDataRequired);
  const { createErrorNotification } = useCreateNotification();
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
      smtpForm.setFields({
        SmtpHost: response.SmtpHost,
        SmtpPort: response.SmtpPort,
        SmtpSender: response.SmtpSender,
        SmtpUsername: response.SmtpUsername,
      });
      setIsEmptyPassword(!response.SmtpPassword.length);
    } catch (err) {
      createErrorNotification(err);
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
      if (!smtpForm.isFormValid) {
        return;
      }
      if (
        isDataRequired ||
        Object.keys(smtpForm.touchedFields).some((field) => smtpForm.touchedFields[field]) ||
        passwordForm.touchedFields.SmtpPassword
      ) {
        const sendPassword = isDataRequired || isPasswordWasTouched;
        await apiService.sendStepData(step.path, { ...smtpForm.fields, ...(sendPassword ? passwordForm.fields : {}) });
      }
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
      title="SMTP information"
      onNextClick={handleSubmit}
      disabledNext={!smtpForm.isFormValid}
      onBackClick={() => handlePrevStep(step)}
    >
      <Typography variant="body1" align="center" paragraph>
        This account is used for sending confirmation and 2FA messages.
      </Typography>
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
              onChange={smtpForm.onChange}
              onFocus={smtpForm.setTouched}
              onSubmit={(e) => e.preventDefault()}
            >
              <TextField
                className={styles.textField}
                error={smtpForm.touchedFields.SmtpHost && !smtpForm.errorObj.SmtpHost.isValid}
                helperText={smtpForm.touchedFields.SmtpHost && smtpForm.errorObj.SmtpHost.helperText}
                name="SmtpHost"
                value={smtpForm.fields.SmtpHost}
                label="SMTP host"
                size="small"
                type="text"
                fullWidth
                inputProps={{ autoComplete: 'off' }}
              />
              <TextField
                className={styles.textField}
                error={smtpForm.touchedFields.SmtpPort && !smtpForm.errorObj.SmtpPort.isValid}
                helperText={smtpForm.touchedFields.SmtpPort && smtpForm.errorObj.SmtpPort.helperText}
                name="SmtpPort"
                value={smtpForm.fields.SmtpPort}
                label="SMTP port"
                size="small"
                type="text"
                fullWidth
                inputProps={{ autoComplete: 'off' }}
              />
              <TextField
                className={styles.textField}
                error={smtpForm.touchedFields.SmtpSender && !smtpForm.errorObj.SmtpSender.isValid}
                helperText={smtpForm.touchedFields.SmtpSender && smtpForm.errorObj.SmtpSender.helperText}
                name="SmtpSender"
                value={smtpForm.fields.SmtpSender}
                label="SMTP sender"
                size="small"
                type="text"
                fullWidth
                inputProps={{ autoComplete: 'off' }}
              />
              <TextField
                className={styles.textField}
                error={smtpForm.touchedFields.SmtpUsername && !smtpForm.errorObj.SmtpUsername.isValid}
                helperText={smtpForm.touchedFields.SmtpUsername && smtpForm.errorObj.SmtpUsername.helperText}
                name="SmtpUsername"
                value={smtpForm.fields.SmtpUsername}
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
                passwordForm.onChange(e);
                if (!e.target.value.includes('↹')) {
                  setPasswordTouched(true);
                }
              }}
              onSubmit={(e) => e.preventDefault()}
            >
              <TextField
                className={styles.textField}
                value={editMode && isDataRequired ? passwordForm.fields.SmtpPassword : undefined}
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
          <InfoTable stepData={smtpForm.fields} />
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
