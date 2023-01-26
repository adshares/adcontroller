import React, { useEffect, useState } from 'react';
import { Icon, Table, TableBody, TableCell, TableRow, Tooltip, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import apiService from '../../../utils/apiService';
import InstallerStepWrapper from '../../../Components/InstallerStepWrapper/InstallerStepWrapper';
import Spinner from '../../../Components/Spinner/Spinner';
import { useCreateNotification } from '../../../hooks';

export const ServiceStatusTable = ({ data }) => {
  const fields = ['adserver', 'adpanel', 'aduser', 'adselect', 'adclassify', 'adpay', 'main.js'];
  return (
    <Table>
      <TableBody>
        {fields
          .filter((field) => data.hasOwnProperty(field))
          .map((field) => (
            <TableRow key={data[field].module}>
              <TableCell align="left">
                <Typography variant="tableText1">{data[field].module}</Typography>
              </TableCell>
              <TableCell align="left">
                <Typography variant="tableText1">{data[field].version}</Typography>
              </TableCell>
              <TableCell align="left">
                <Typography variant="tableText1">{data[field].url}</Typography>
              </TableCell>
              <TableCell>
                <Tooltip title={data[field].code}>
                  <Icon>{data[field].code === 200 ? <CheckIcon color="success" /> : <CloseIcon color="error" />}</Icon>
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
