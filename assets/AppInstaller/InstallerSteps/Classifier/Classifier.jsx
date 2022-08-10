import React, { useEffect, useState } from 'react';
import { Box, Button, LinearProgress, TextField, Typography } from '@mui/material';
import apiService from '../../../utils/apiService';
import InstallerStepWrapper from '../../../Components/InstallerStepWrapper/InstallerStepWrapper';
import styles from './styles.scss';
import { useForm } from '../../../hooks';

function Classifier({ handleNextStep, handlePrevStep, step }) {
  const { fields } = useForm({ apiKey: '', apiSecret: '' });
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
      await apiService.sendStepData(step.path, {});
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
      disabledNext={registrationInProgress || isLoading}
      onBackClick={() => handlePrevStep(step)}
    >
      <Box className={styles.container}>
        <Typography align="center" gutterBottom variant="h6">
          Registration in AdClassify
        </Typography>
        <Typography variant="body1" paragraph align="justify">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab, accusamus amet aperiam architecto beatae doloremque est et explicabo
          harum id odio officia quae quas quod sint temporibus vitae voluptas voluptatem.
        </Typography>
        {editMode && (
          <Box className={styles.formThumb}>
            <TextField
              sx={{ width: '50%' }}
              size="small"
              name="apiKey"
              label="Your api key"
              margin="dense"
              value={fields.apiKey}
              type="text"
              fullWidth
              inputProps={{ autoComplete: 'off' }}
            />
            <TextField
              sx={{ width: '50%' }}
              size="small"
              name="apiSecret"
              label="Your api secret"
              margin="dense"
              value={fields.apiSecret}
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
        {!editMode && (
          <Box className={styles.editButtonThumb}>
            <Button onClick={() => setEditMode(true)} type="button">
              Already have api key
            </Button>
          </Box>
        )}
      </Box>
    </InstallerStepWrapper>
  );
}

export default Classifier;
