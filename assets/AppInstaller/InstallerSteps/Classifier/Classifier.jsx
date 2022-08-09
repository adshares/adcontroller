import React, { useEffect, useState } from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import apiService from '../../../utils/apiService';
import InstallerStepWrapper from '../../../Components/InstallerStepWrapper/InstallerStepWrapper';
import styles from './styles.scss';

function Classifier({ handleNextStep, handlePrevStep, step }) {
  const [isLoading, setIsLoading] = useState(true);
  const [registrationInProgress, setRegistrationInProgress] = useState(false);
  const [stepData, setStepData] = useState({});
  const [alert, setAlert] = useState({ type: '', message: '' });

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
        <Typography gutterBottom ma variant="h6">
          Registration in AdClassify
        </Typography>
        <Typography variant="body1" paragraph align="justify">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab, accusamus amet aperiam architecto beatae doloremque est et explicabo
          harum id odio officia quae quas quod sint temporibus vitae voluptas voluptatem.
        </Typography>
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
