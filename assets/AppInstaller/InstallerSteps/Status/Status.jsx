import React, { useEffect, useState } from 'react';
import apiService from '../../../utils/apiService';
import InstallerStepWrapper from '../../../Components/InstallerStepWrapper/InstallerStepWrapper';
import ServiceStatusTable from '../../../Components/ServiceStatusTable/ServiceStatusTable';
import Spinner from '../../../Components/Spinner/Spinner';
import { useCreateNotification } from '../../../hooks';

function Status({ handlePrevStep, step }) {
  const [isLoading, setIsLoading] = useState(true);
  const [stepData, setStepData] = useState({
    DataRequired: false,
  });
  const { createErrorNotification } = useCreateNotification();

  useEffect(() => {
    getStepData().catch((error) => console.log(error));
  }, []);

  const getStepData = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCurrentStepData(step.path);
      setStepData(response);
    } catch (err) {
      createErrorNotification(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await apiService.sendStepData(step.path, {});
      window.location.reload();
    } catch (err) {
      setIsLoading(false);
      createErrorNotification(err);
    }
  };

  return (
    <InstallerStepWrapper
      title="Status"
      disabledNext={isLoading}
      onBackClick={() => handlePrevStep(step)}
      onNextClick={handleSubmit}
      isLastCard
    >
      {isLoading ? <Spinner /> : <ServiceStatusTable data={stepData} />}
    </InstallerStepWrapper>
  );
}

export default Status;
