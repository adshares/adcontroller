import React, { useEffect, useState } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material';
import apiService from '../../../utils/apiService';
import InstallerStepWrapper from '../../../Components/InstallerStepWrapper/InstallerStepWrapper';
import styles from './styles.scss';
import Spinner from '../../../Components/Spinner/Spinner';
import { useForm } from '../../../hooks';

const License = ({ handleNextStep, handlePrevStep, step }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLicenseLoading, setIsLicenseLoading] = useState(true);
  const [stepData, setStepData] = useState({
    DemandFee: 0.01,
    FixedFee: 0,
    SupplyFee: 0.01,
    Owner: '',
    DateStart: '',
    DateEnd: '',
    Type: '',
    PaymentAddress: '',
    PaymentMessage: '',
    PrivateLabel: false,
    Status: 1,
  });
  const [editMode, setEditMode] = useState(false);
  const form = useForm({
    initialFields: {
      licenseKey: '',
    },
    validation: {
      licenseKey: ['licenseKey'],
    },
  });
  const [alert, setAlert] = useState({
    type: 'error',
    message: '',
    title: '',
  });

  console.log(form);

  useEffect(() => {
    getStepData();
  }, []);

  const getStepData = async () => {
    try {
      setIsLoading(true);
      const { LicenseData, DataRequired } = await apiService.getCurrentStepData(step.path);
      setStepData({ ...stepData, ...LicenseData });
      setEditMode(DataRequired);
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
      const response = await apiService.getLicenseByKey({ LicenseKey: form.fields.licenseKey });
      setIsLicenseLoading(false);
      setStepData({ ...response.LicenseData });
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
      setStepData({ ...response.LicenseData });
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
      disabledNext={!stepData.Owner}
    >
      <Typography variant="body1" paragraph align="center">
        You can run the adserver under free Community License.
        <br />
        <br />
        1% of ad turnover of every adserver is burned what reduces the free floating supply of ADS. Liquid staking rewards bring back the
        burned ADS flowing them from active users to long term holders.
      </Typography>
      {editMode && (
        <Box className={styles.container}>
          <Box
            className={styles.form}
            component="form"
            onChange={form.onChange}
            onFocus={form.setTouched}
            onSubmit={(e) => e.preventDefault()}
          >
            <Box className={styles.field}>
              <TextField
                error={form.touchedFields.licenseKey && !form.errorObj.licenseKey.isValid}
                helperText={form.touchedFields.licenseKey && form.errorObj.licenseKey.helperText}
                placeholder="XXX-xxxxxx-xxxxx-xxxxx-xxxx-xxxx"
                size="small"
                name="licenseKey"
                label="Your license key"
                value={form.fields.licenseKey}
                type="text"
                fullWidth
                inputProps={{ autoComplete: 'off' }}
              />
            </Box>
            <Button
              disabled={!form.isFormValid || !form.fields.licenseKey}
              type="button"
              variant="contained"
              onClick={handleGetLicenseClick}
            >
              Get license
            </Button>
          </Box>
          <Box className={styles.freeLicense}>
            {!stepData.Owner && (
              <Button onClick={handleGetFreeLicenseClick} type="button" variant="text">
                Get free license
              </Button>
            )}
          </Box>

          {editMode && (isLicenseLoading ? <Spinner /> : stepData.Owner && <InfoTable stepData={stepData} />)}
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
  <Table sx={{ mt: 1 }}>
    <TableBody>
      <TableRow>
        <TableCell align="left">License owner</TableCell>
        <TableCell align="left">{stepData.Owner}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell align="left">License type</TableCell>
        <TableCell align="left">{stepData.Type}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell align="left">License expiration date</TableCell>
        <TableCell align="left">{stepData.DateEnd.replace('T', ' ').slice(0, stepData.DateEnd.length - 6)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell align="left">Fixed fee</TableCell>
        <TableCell align="left">{stepData.FixedFee} ADS</TableCell>
      </TableRow>
      <TableRow>
        <TableCell align="left">Supply fee / Demand fee</TableCell>
        <TableCell align="left">
          {stepData.SupplyFee * 100}% / {stepData.DemandFee * 100}%
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
);
