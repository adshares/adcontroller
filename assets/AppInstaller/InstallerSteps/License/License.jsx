import React, { useEffect, useState } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableRow, TextField } from '@mui/material';
import apiService from '../../../utils/apiService';
import InstallerStepWrapper from '../../../Components/InstallerStepWrapper/InstallerStepWrapper';
import styles from './styles.scss';
import Spinner from '../../../Components/Spinner/Spinner';
import { useForm } from '../../../hooks';

const License = ({ handleNextStep, handlePrevStep, step }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLicenseLoading, setIsLicenseLoading] = useState(true);
  const [stepData, setStepData] = useState({
    demand_fee: 0.01,
    fixed_fee: 0,
    supply_fee: 0.01,
    owner: '',
    date_end: '',
    type: '',
    date_start: '',
    payment_address: '',
    payment_message: '',
    private_label: false,
    status: 1,
  });
  const [editMode, setEditMode] = useState(false);
  const { fields, errorObj, isFormValid, onFormChange, validate } = useForm({ licenseKey: '' });
  const [alert, setAlert] = useState({ type: 'error', message: '', title: '' });

  useEffect(() => {
    getStepData();
  }, []);

  const getStepData = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCurrentStepData(step.path);
      setStepData({ ...stepData, ...response.license_data });
      setEditMode(response.data_required);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.data.message,
        title: err.message,
      });
    } finally {
      setIsLoading(false);
      setIsLicenseLoading(false);
    }
  };

  const handleGetLicenseClick = async () => {
    try {
      setIsLicenseLoading(true);
      const response = await apiService.getLicenseByKey({ license_key: fields.licenseKey });
      setIsLicenseLoading(false);
      setStepData({ ...response.license_data });
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.data.message,
        title: err.message,
      });
    } finally {
      setIsLicenseLoading(false);
    }
  };

  const handleGetFreeLicenseClick = async () => {
    try {
      setIsLicenseLoading(true);
      const response = await apiService.getCommunityLicense();
      setStepData({ ...response.license_data });
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.data.message,
        title: err.message,
      });
    } finally {
      setIsLicenseLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    handleNextStep(step);
    setIsLoading(false);
  };

  return (
    <InstallerStepWrapper
      alert={alert}
      dataLoading={isLoading}
      title="License information"
      onNextClick={handleSubmit}
      onBackClick={() => handlePrevStep(step)}
      disabledNext={!stepData.owner}
    >
      {editMode && (
        <Box className={styles.container}>
          <Box
            className={styles.form}
            component="form"
            onChange={onFormChange}
            onBlur={(e) => validate(e.target)}
            onSubmit={(e) => e.preventDefault()}
          >
            <Box className={styles.field}>
              <TextField
                error={!!errorObj.licenseKey}
                helperText={errorObj.licenseKey}
                placeholder="XXX-xxxxxx-xxxxx-xxxxx-xxxx-xxxx"
                size="small"
                name="licenseKey"
                label="Your license key"
                value={fields.licenseKey}
                type="text"
                fullWidth
              />
            </Box>
            <Button disabled={!isFormValid} type="button" variant="contained" onClick={handleGetLicenseClick}>
              Get license
            </Button>
          </Box>

          {editMode && (isLicenseLoading ? <Spinner /> : stepData.owner && <InfoTable stepData={stepData} />)}

          <Box className={styles.freeLicense}>
            {!stepData.owner && (
              <Button onClick={handleGetFreeLicenseClick} type="button" variant="text">
                Get free license
              </Button>
            )}
          </Box>
        </Box>
      )}

      {!editMode && (
        <>
          <Box className={styles.editButtonThumb}>
            <Button onClick={() => setEditMode(true)} type="button">
              Edit
            </Button>
          </Box>
          <InfoTable stepData={stepData} />
        </>
      )}
    </InstallerStepWrapper>
  );
};

export default License;

const InfoTable = ({ stepData }) => (
  <Table>
    <TableBody>
      <TableRow>
        <TableCell align="left">License owner</TableCell>
        <TableCell align="left">{stepData.owner}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell align="left">License type</TableCell>
        <TableCell align="left">{stepData.type}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell align="left">License will expire</TableCell>
        <TableCell align="left">{stepData.date_end.replace('T', ' ').slice(0, stepData.date_end.length - 6)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell align="left">Fixed fee</TableCell>
        <TableCell align="left">{stepData.fixed_fee} ADS</TableCell>
      </TableRow>
      <TableRow>
        <TableCell align="left">Supply fee / Demand fee</TableCell>
        <TableCell align="left">
          {stepData.supply_fee * 100}% / {stepData.demand_fee * 100}%
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
);
