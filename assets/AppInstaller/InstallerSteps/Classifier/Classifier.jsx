import React, { useEffect, useState } from 'react';
import { Box, Button, LinearProgress, TextField, Typography } from '@mui/material';
import apiService from '../../../utils/apiService';
import InstallerStepWrapper from '../../../Components/InstallerStepWrapper/InstallerStepWrapper';
import styles from './styles.scss';
import { useForm, useCreateNotification } from '../../../hooks';

function Classifier({ handleNextStep, handlePrevStep, step }) {
  const form = useForm({
    initialFields: {
      apiKey: '',
      apiSecret: '',
    },
    validation: {
      apiKey: ['required'],
      apiSecret: ['required'],
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [registrationInProgress, setRegistrationInProgress] = useState(false);
  const [stepData, setStepData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const { createErrorNotification } = useCreateNotification();

  useEffect(() => {
    getStepData();
  }, []);

  const getStepData = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCurrentStepData(step.path);
      setStepData({ ...stepData, ...response });
      form.setFields({
        ...form.fields,
        apiKey: response.ApiKeyName || '',
      });
    } catch (err) {
      createErrorNotification(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setRegistrationInProgress(true);
      const body = editMode
        ? {
            ApiKeyName: form.fields.apiKey,
            ApiKeySecret: form.fields.apiSecret,
          }
        : {};
      await apiService.sendStepData(step.path, body);
      handleNextStep(step);
    } catch (err) {
      createErrorNotification(err);
    } finally {
      setRegistrationInProgress(false);
    }
  };

  return (
    <InstallerStepWrapper
      dataLoading={isLoading}
      title="Classifier information"
      onNextClick={handleSubmit}
      disabledNext={registrationInProgress || isLoading || (editMode && !form.isFormValid)}
      onBackClick={() => handlePrevStep(step)}
    >
      <Typography align="center" gutterBottom variant="h6">
        Registration in AdClassify
      </Typography>
      <Typography variant="body1" paragraph align="center">
        AdClassify provides data about banners and allow Publishers to effectively filter unwanted content. You can register with the
        adshares community adclassify for free.
      </Typography>
      <Box className={styles.editButtonThumb}>
        <Button onClick={() => setEditMode((prevState) => !prevState)} type="button">
          {editMode ? 'Cancel' : 'Already have an account'}
        </Button>
      </Box>
      {editMode && (
        <Box className={styles.container}>
          <Box
            className={styles.formBlock}
            component="form"
            onChange={form.onChange}
            onFocus={form.setTouched}
            onSubmit={(e) => e.preventDefault()}
          >
            <TextField
              className={styles.textField}
              error={form.touchedFields.apiKey && !form.errorObj.apiKey.isValid}
              helperText={form.touchedFields.apiKey && form.errorObj.apiKey.helperText}
              size="small"
              name="apiKey"
              label="Api key"
              margin="dense"
              value={form.fields.apiKey}
              type="text"
              fullWidth
              inputProps={{ autoComplete: 'off' }}
            />
            <TextField
              className={styles.textField}
              error={form.touchedFields.apiSecret && !form.errorObj.apiSecret.isValid}
              helperText={form.touchedFields.apiSecret && form.errorObj.apiSecret.helperText}
              size="small"
              name="apiSecret"
              label="Api secret"
              margin="dense"
              value={form.fields.apiSecret}
              type="text"
              fullWidth
              inputProps={{ autoComplete: 'off' }}
            />
          </Box>
        </Box>
      )}
      {registrationInProgress && (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      )}
    </InstallerStepWrapper>
  );
}

export default Classifier;
