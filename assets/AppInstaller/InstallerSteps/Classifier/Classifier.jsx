import React, { useEffect, useState } from 'react';
import { Box, Button, LinearProgress, TextField, Typography } from '@mui/material';
import apiService from '../../../utils/apiService';
import InstallerStepWrapper from '../../../Components/InstallerStepWrapper/InstallerStepWrapper';
import styles from './styles.scss';
import { useForm } from '../../../hooks';

function Classifier({ handleNextStep, handlePrevStep, step }) {
  const { fields, onFormChange, errorObj, isFormValid } = useForm({ apiKey: '', apiSecret: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [registrationInProgress, setRegistrationInProgress] = useState(false);
  const [stepData, setStepData] = useState({});
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    getStepData();
  }, []);

  const getStepData = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCurrentStepData(step.path);
      setStepData({ ...stepData, ...response });
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
      setRegistrationInProgress(true);
      const body = editMode ? {
        ApiKeyName: fields.apiKey,
        ApiKeySecret: fields.apiSecret,
      } : {};
      await apiService.sendStepData(step.path, body);
      handleNextStep(step);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.data.message,
        title: err.message,
      });
    } finally {
      setRegistrationInProgress(false);
    }
  };

  return (
    <InstallerStepWrapper
      alert={alert}
      dataLoading={isLoading}
      title="Classifier information"
      onNextClick={handleSubmit}
      disabledNext={registrationInProgress || isLoading || (editMode && !isFormValid)}
      onBackClick={() => handlePrevStep(step)}
    >
      <Box className={styles.container}>
        <Typography align="center" gutterBottom variant="h6">
          Registration in AdClassify
        </Typography>
        <Typography variant="body1" paragraph align="center">
          AdClassify provides data about banners and allow Publishers to effectively filter unwanted content.
          You can register with the adshares community adclassify for free.
        </Typography>
        <Box className={styles.editButtonThumb}>
          <Button onClick={() => setEditMode((prevState) => !prevState)} type="button">
            {editMode ? 'Cancel' : 'Already have an account'}
          </Button>
        </Box>
        {editMode && (
          <Box className={styles.formThumb}>
            <TextField
              sx={{ width: '50%' }}
              error={!!errorObj.apiKey}
              helperText={errorObj.apiKey}
              size="small"
              name="apiKey"
              label="Api key"
              margin="dense"
              value={fields.apiKey}
              onChange={onFormChange}
              type="text"
              fullWidth
              inputProps={{ autoComplete: 'off' }}
            />
            <TextField
              sx={{ width: '50%' }}
              error={!!errorObj.apiSecret}
              helperText={errorObj.apiSecret}
              size="small"
              name="apiSecret"
              label="Api secret"
              margin="dense"
              value={fields.apiSecret}
              onChange={onFormChange}
              type="text"
              fullWidth
              inputProps={{ autoComplete: 'off' }}
            />
          </Box>
        )}
        {registrationInProgress && (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        )}
      </Box>
    </InstallerStepWrapper>
  );
}

export default Classifier;
