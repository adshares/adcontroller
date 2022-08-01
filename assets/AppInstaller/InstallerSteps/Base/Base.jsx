import React, { useEffect, useState } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableRow, TextField } from '@mui/material';
import { useForm } from '../../../hooks';
import apiService from '../../../utils/apiService';
import InstallerStepWrapper from '../../../Components/InstallerStepWrapper/InstallerStepWrapper';
import styles from './styles.scss';

function Base({ handleNextStep, step }) {
  const [isLoading, setIsLoading] = useState(true);
  const { fields, errorObj, setFields, isFormValid, onFormChange, validate } = useForm({
    base_adserver_name: '',
    base_technical_email: '',
    base_domain: '',
    base_support_email: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [dataRequired, setDataRequired] = useState(false);
  const [alert, setAlert] = useState({
    type: '',
    message: '',
    title: '',
  });
  const [isFormWasTouched, setFormTouched] = useState(false);

  useEffect(() => {
    getStepData();
  }, []);

  const getStepData = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCurrentStepData(step.path);
      const {
        base_adserver_name,
        base_technical_email,
        base_domain,
        base_support_email,
        data_required,
      } = response;
      setFields({
        ...fields,
        ...{
          base_adserver_name: base_adserver_name || '',
          base_technical_email: base_technical_email || '',
          base_domain: base_domain || '',
          base_support_email: base_support_email || '',
        },
      });
      setEditMode(data_required);
      setDataRequired(data_required);
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
      setIsLoading(true);
      if (!editMode) {
        handleNextStep(step);
        return;
      }
      if (isFormWasTouched) {
        await apiService.sendStepData(step.path, {
          ...fields,
        });
      }
      handleNextStep(step);
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

  return (
    <InstallerStepWrapper
      alert={alert}
      dataLoading={isLoading}
      title="Base information"
      onNextClick={handleSubmit}
      disabledNext={!isFormValid}
      hideBackButton
    >
      <Box className={styles.editButtonThumb}>
        <Button className={dataRequired ? styles.hidden : styles.visible} onClick={() => setEditMode(!editMode)} type="button">
          {editMode ? 'Cancel' : 'Edit'}
        </Button>
      </Box>

      {editMode && (
        <Box className={styles.container}>
          <Box
            className={styles.formBase}
            component="form"
            onChange={onFormChange}
            onBlur={(e) => validate(e.target)}
            onClick={() => setFormTouched(true)}
            onSubmit={(e) => e.preventDefault()}
          >
            <Box className={styles.formBlock}>
              <TextField
                className={styles.textField}
                error={!!errorObj.base_adserver_name}
                helperText={errorObj.base_adserver_name}
                size="small"
                name="base_adserver_name"
                label="AdServer name"
                value={fields.base_adserver_name}
                type="text"
                required
                inputProps={{ autoComplete: 'off' }}
              />
              <TextField
                className={styles.textField}
                error={!!errorObj.base_domain}
                helperText={errorObj.base_domain}
                size="small"
                name="base_domain"
                label="Domain name"
                value={fields.base_domain}
                type="text"
                required
                inputProps={{ autoComplete: 'off' }}
              />
            </Box>
            <Box className={styles.formBlock}>
              <TextField
                className={styles.textField}
                error={!!errorObj.base_support_email}
                helperText={errorObj.base_support_email}
                size="small"
                name="base_support_email"
                label="Email to support"
                value={fields.base_support_email}
                type="email"
                placeholder="support@domain.xyz"
                required
                inputProps={{ autoComplete: 'off' }}
              />
              <TextField
                className={styles.textField}
                error={!!errorObj.base_technical_email}
                helperText={errorObj.base_technical_email}
                size="small"
                name="base_technical_email"
                label="AdServer's operator email"
                value={fields.base_technical_email}
                type="email"
                placeholder="tech@domain.xyz"
                required
                inputProps={{ autoComplete: 'off' }}
              />
            </Box>
          </Box>
        </Box>
      )}

      {!editMode && (
        <InfoTable
          stepData={{
            ...fields,
          }}
        />
      )}
    </InstallerStepWrapper>
  );
}

export default Base;

function InfoTable({ stepData }) {
  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell align="left">AdServer name</TableCell>
          <TableCell align="left">{stepData.base_adserver_name}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="left">Domain</TableCell>
          <TableCell align="left">{stepData.base_domain}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="left">Email to support</TableCell>
          <TableCell align="left">{stepData.base_support_email}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="left">AdServer's operator email</TableCell>
          <TableCell align="left">{stepData.base_technical_email}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
