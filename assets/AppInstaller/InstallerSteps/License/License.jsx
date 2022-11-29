import React, { useEffect, useState } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material';
import apiService from '../../../utils/apiService';
import InstallerStepWrapper from '../../../Components/InstallerStepWrapper/InstallerStepWrapper';
import Spinner from '../../../Components/Spinner/Spinner';
import { useForm, useCreateNotification } from '../../../hooks';
import commonStyles from '../../../styles/commonStyles.scss';

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
  const { createErrorNotification } = useCreateNotification();

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
      createErrorNotification(err);
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
      createErrorNotification(err);
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
      createErrorNotification(err);
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
        <>
          <Box
            sx={{ mb: 2 }}
            className={`${commonStyles.flex} ${commonStyles.alignCenter}`}
            component="form"
            onChange={form.onChange}
            onFocus={form.setTouched}
            onSubmit={(e) => e.preventDefault()}
          >
            <TextField
              customvariant="highLabel"
              color="secondary"
              error={form.touchedFields.licenseKey && !form.errorObj.licenseKey.isValid}
              helperText={form.touchedFields.licenseKey && form.errorObj.licenseKey.helperText}
              placeholder="XXX-xxxxxx-xxxxx-xxxxx-xxxx-xxxx"
              name="licenseKey"
              label="Your license key"
              value={form.fields.licenseKey}
              type="text"
              fullWidth
              inputProps={{ autoComplete: 'off' }}
            />
            <Button
              sx={{ whiteSpace: 'nowrap', ml: 4.25, mt: 3 }}
              disabled={!form.isFormValid || !form.fields.licenseKey}
              type="button"
              variant="contained"
              onClick={handleGetLicenseClick}
            >
              Get license
            </Button>
          </Box>
          {!stepData.Owner && (
            <Button onClick={handleGetFreeLicenseClick} type="button" variant="text">
              Get free license
            </Button>
          )}
          {editMode && (isLicenseLoading ? <Spinner /> : stepData.Owner && <InfoTable stepData={stepData} />)}
        </>
      )}

      {!editMode && (
        <>
          <Box className={`${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
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
        <TableCell align="left">
          <Typography variant="tableText1">License owner</Typography>
        </TableCell>
        <TableCell align="left">
          <Typography variant="tableText1">{stepData.Owner}</Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell align="left">
          <Typography variant="tableText1">License type</Typography>
        </TableCell>
        <TableCell align="left">
          <Typography variant="tableText1">{stepData.Type}</Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell align="left">
          <Typography variant="tableText1">License expiration date</Typography>
        </TableCell>
        <TableCell align="left">
          <Typography variant="tableText1">{stepData.DateEnd.replace('T', ' ').slice(0, stepData.DateEnd.length - 6)}</Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell align="left">
          <Typography variant="tableText1">Fixed fee</Typography>
        </TableCell>
        <TableCell align="left">
          <Typography variant="tableText1">{stepData.FixedFee} ADS</Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell align="left">
          <Typography variant="tableText1">Supply fee / Demand fee</Typography>
        </TableCell>
        <TableCell align="left">
          <Typography variant="tableText1">
            {stepData.SupplyFee * 100}% / {stepData.DemandFee * 100}%
          </Typography>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
);
