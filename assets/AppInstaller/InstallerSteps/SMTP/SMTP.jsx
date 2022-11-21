import React, { useEffect, useState } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material';
import apiService from '../../../utils/apiService';
import InstallerStepWrapper from '../../../Components/InstallerStepWrapper/InstallerStepWrapper';
import { useForm, useCreateNotification } from '../../../hooks';
import commonStyles from '../../../styles/commonStyles.scss';

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
      if (isDataRequired || isPasswordWasTouched || Object.keys(smtpForm.touchedFields).some((field) => smtpForm.touchedFields[field])) {
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
            <Box className={`${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
              <Button onClick={() => setEditMode(false)} type="button">
                Cancel
              </Button>
            </Box>
          )}
          <Box
            sx={{ width: '380px' }}
            component="form"
            onChange={smtpForm.onChange}
            onFocus={smtpForm.setTouched}
            onSubmit={(e) => e.preventDefault()}
          >
            <TextField
              customvariant="highLabel"
              color="secondary"
              sx={{ mb: 3 }}
              error={smtpForm.touchedFields.SmtpHost && !smtpForm.errorObj.SmtpHost.isValid}
              helperText={smtpForm.touchedFields.SmtpHost && smtpForm.errorObj.SmtpHost.helperText}
              name="SmtpHost"
              value={smtpForm.fields.SmtpHost}
              label="SMTP host"
              type="text"
              fullWidth
              inputProps={{ autoComplete: 'off' }}
            />
            <TextField
              customvariant="highLabel"
              color="secondary"
              sx={{ mb: 3 }}
              error={smtpForm.touchedFields.SmtpPort && !smtpForm.errorObj.SmtpPort.isValid}
              helperText={smtpForm.touchedFields.SmtpPort && smtpForm.errorObj.SmtpPort.helperText}
              name="SmtpPort"
              value={smtpForm.fields.SmtpPort}
              label="SMTP port"
              type="text"
              fullWidth
              inputProps={{ autoComplete: 'off' }}
            />
            <TextField
              customvariant="highLabel"
              color="secondary"
              sx={{ mb: 3 }}
              error={smtpForm.touchedFields.SmtpSender && !smtpForm.errorObj.SmtpSender.isValid}
              helperText={smtpForm.touchedFields.SmtpSender && smtpForm.errorObj.SmtpSender.helperText}
              name="SmtpSender"
              value={smtpForm.fields.SmtpSender}
              label="SMTP sender"
              type="text"
              fullWidth
              inputProps={{ autoComplete: 'off' }}
            />
            <TextField
              customvariant="highLabel"
              color="secondary"
              sx={{ mb: 3 }}
              error={smtpForm.touchedFields.SmtpUsername && !smtpForm.errorObj.SmtpUsername.isValid}
              helperText={smtpForm.touchedFields.SmtpUsername && smtpForm.errorObj.SmtpUsername.helperText}
              name="SmtpUsername"
              value={smtpForm.fields.SmtpUsername}
              label="SMTP username"
              type="text"
              fullWidth
              inputProps={{ autoComplete: 'off' }}
            />
          </Box>
          <Box
            sx={{ width: '380px' }}
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
              customvariant="highLabel"
              color="secondary"
              value={editMode && isDataRequired ? passwordForm.fields.SmtpPassword : undefined}
              defaultValue={editMode && !isDataRequired && !isEmptyPassword ? '↹↹↹↹↹↹↹↹' : undefined}
              name="SmtpPassword"
              label="New password"
              type="password"
              fullWidth
              inputProps={{ autoComplete: 'off' }}
            />
          </Box>
        </>
      )}

      {!editMode && (
        <>
          <Box className={`${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
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
        <TableCell align="left">
          <Typography variant="tableAssetsText">SMTP host</Typography>
        </TableCell>
        <TableCell align="left">
          <Typography variant="tableAssetsText">{stepData.SmtpHost}</Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell align="left">
          <Typography variant="tableAssetsText">SMTP port</Typography>
        </TableCell>
        <TableCell align="left">
          <Typography variant="tableAssetsText">{stepData.SmtpPort}</Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell align="left">
          <Typography variant="tableAssetsText">SMTP sender</Typography>
        </TableCell>
        <TableCell align="left">
          <Typography variant="tableAssetsText">{stepData.SmtpSender}</Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell align="left">
          <Typography variant="tableAssetsText">SMTP username</Typography>
        </TableCell>
        <TableCell align="left">
          <Typography variant="tableAssetsText">{stepData.SmtpUsername}</Typography>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
);
