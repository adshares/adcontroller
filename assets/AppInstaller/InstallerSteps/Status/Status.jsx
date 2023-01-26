import React, { useEffect, useState } from 'react';
import { Icon, Table, TableBody, TableCell, TableRow, Tooltip, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import apiService from '../../../utils/apiService';
import InstallerStepWrapper from '../../../Components/InstallerStepWrapper/InstallerStepWrapper';
import Spinner from '../../../Components/Spinner/Spinner';
import { useCreateNotification } from '../../../hooks';

const StatusTable = ({ stepData }) => {
  const fields = ['adserver', 'adpanel', 'aduser', 'adselect', 'adclassify', 'adpay', 'main.js'];
  return (
    <Table>
      <TableBody>
        {fields
          .filter((field) => stepData.hasOwnProperty(field))
          .map((field) => (
            <TableRow key={stepData[field].module}>
              <TableCell align="left">
                <Typography variant="tableText1">{stepData[field].module}</Typography>
              </TableCell>
              <TableCell align="left">
                <Typography variant="tableText1">{stepData[field].version}</Typography>
              </TableCell>
              <TableCell align="left">
                <Typography variant="tableText1">{stepData[field].url}</Typography>
              </TableCell>
              <TableCell>
                <Tooltip title={stepData[field].code}>
                  <Icon>{stepData[field].code === 200 ? <CheckIcon color="success" /> : <CloseIcon color="error" />}</Icon>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};

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
      setStepData({
        adclassify: response.adclassify,
        adpanel: response.adpanel,
        adpay: response.adpay,
        adselect: response.adselect,
        adserver: response.adserver,
        aduser: response.aduser,
        'main.js': response['main.js'],
      });
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
      {isLoading ? <Spinner /> : <StatusTable stepData={stepData} />}
    </InstallerStepWrapper>
  );
}

export default Status;
