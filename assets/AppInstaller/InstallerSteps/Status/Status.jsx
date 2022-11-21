import React, { useEffect, useState } from 'react';
import { Icon, Table, TableBody, TableCell, TableRow, Tooltip, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import apiService from '../../../utils/apiService';
import InstallerStepWrapper from '../../../Components/InstallerStepWrapper/InstallerStepWrapper';
import Spinner from '../../../Components/Spinner/Spinner';
import { useCreateNotification } from '../../../hooks';

function Status({ handlePrevStep, step }) {
  const [isLoading, setIsLoading] = useState(true);
  const [stepData, setStepData] = useState({
    adclassify: {
      module: null,
      version: null,
      url: null,
      code: null,
    },
    adpanel: {
      module: null,
      version: null,
      url: null,
      code: null,
    },
    adpay: {
      module: null,
      version: null,
      url: null,
      code: null,
    },
    adselect: {
      module: null,
      version: null,
      url: null,
      code: null,
    },
    adserver: {
      module: null,
      version: null,
      url: null,
      code: null,
    },
    aduser: {
      module: null,
      version: null,
      url: null,
      code: null,
    },
    'main.js': {
      module: null,
      version: null,
      url: null,
      code: null,
    },
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
      {isLoading ? (
        <Spinner />
      ) : (
        <Table>
          <TableBody>
            <TableRow>
              <TableCell align="left">
                <Typography variant="tableAssetsText">{stepData.adserver.module}</Typography>
              </TableCell>
              <TableCell align="left">
                <Typography variant="tableAssetsText">{stepData.adserver.version}</Typography>
              </TableCell>
              <TableCell align="left">
                <Typography variant="tableAssetsText">{stepData.adserver.url}</Typography>
              </TableCell>
              <TableCell>
                <Tooltip title={stepData.adserver.code}>
                  <Icon>{stepData.adserver.code === 200 ? <CheckIcon color="success" /> : <CloseIcon color="error" />}</Icon>
                </Tooltip>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left">
                <Typography variant="tableAssetsText">{stepData.adpanel.module}</Typography>
              </TableCell>
              <TableCell align="left">
                <Typography variant="tableAssetsText">{stepData.adpanel.version}</Typography>
              </TableCell>
              <TableCell align="left">
                <Typography variant="tableAssetsText">{stepData.adpanel.url}</Typography>
              </TableCell>
              <TableCell>
                <Tooltip title={stepData.adpanel.code}>
                  <Icon>{stepData.adpanel.code === 200 ? <CheckIcon color="success" /> : <CloseIcon color="error" />}</Icon>
                </Tooltip>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left">
                <Typography variant="tableAssetsText">{stepData.aduser.module}</Typography>
              </TableCell>
              <TableCell align="left">
                <Typography variant="tableAssetsText">{stepData.aduser.version}</Typography>
              </TableCell>
              <TableCell align="left">
                <Typography variant="tableAssetsText">{stepData.aduser.url}</Typography>
              </TableCell>
              <TableCell>
                <Tooltip title={stepData.aduser.code}>
                  <Icon>{stepData.aduser.code === 200 ? <CheckIcon color="success" /> : <CloseIcon color="error" />}</Icon>
                </Tooltip>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left">
                <Typography variant="tableAssetsText">{stepData.adselect.module}</Typography>
              </TableCell>
              <TableCell align="left">
                <Typography variant="tableAssetsText">{stepData.adselect.version}</Typography>
              </TableCell>
              <TableCell align="left">
                <Typography variant="tableAssetsText">{stepData.adselect.url}</Typography>
              </TableCell>
              <TableCell>
                <Tooltip title={stepData.adselect.code}>
                  <Icon>{stepData.adselect.code === 200 ? <CheckIcon color="success" /> : <CloseIcon color="error" />}</Icon>
                </Tooltip>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left">
                <Typography variant="tableAssetsText">{stepData.adclassify.module}</Typography>
              </TableCell>
              <TableCell align="left">
                <Typography variant="tableAssetsText">{stepData.adclassify.version}</Typography>
              </TableCell>
              <TableCell align="left">
                <Typography variant="tableAssetsText">{stepData.adclassify.url}</Typography>
              </TableCell>
              <TableCell>
                <Tooltip title={stepData.adclassify.code}>
                  <Icon>{stepData.adclassify.code === 200 ? <CheckIcon color="success" /> : <CloseIcon color="error" />}</Icon>
                </Tooltip>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left">
                <Typography variant="tableAssetsText">{stepData.adpay.module}</Typography>
              </TableCell>
              <TableCell align="left">
                <Typography variant="tableAssetsText">{stepData.adpay.version}</Typography>
              </TableCell>
              <TableCell align="left">
                <Typography variant="tableAssetsText">{stepData.adpay.url}</Typography>
              </TableCell>
              <TableCell>
                <Tooltip title={stepData.adpay.code}>
                  <Icon>{stepData.adpay.code === 200 ? <CheckIcon color="success" /> : <CloseIcon color="error" />}</Icon>
                </Tooltip>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left">
                <Typography variant="tableAssetsText">{stepData['main.js'].module}</Typography>
              </TableCell>
              <TableCell align="left">
                <Typography variant="tableAssetsText">{stepData['main.js'].version}</Typography>
              </TableCell>
              <TableCell align="left">
                <Typography variant="tableAssetsText">{stepData['main.js'].url}</Typography>
              </TableCell>
              <TableCell>
                <Tooltip title={stepData['main.js'].code}>
                  <Icon>{stepData['main.js'].code === 200 ? <CheckIcon color="success" /> : <CloseIcon color="error" />}</Icon>
                </Tooltip>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </InstallerStepWrapper>
  );
}

export default Status;
