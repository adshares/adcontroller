import React, { useEffect, useState } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableRow, TextField } from '@mui/material';
import { useForm } from '../../../hooks';
import apiService from '../../../utils/apiService';
import InstallerStepWrapper from '../../../Components/InstallerStepWrapper/InstallerStepWrapper';
import styles from './styles.scss';

function Base({ handleNextStep, step }) {
  const [isLoading, setIsLoading] = useState(true);
  const { fields, errorObj, setFields, isFormValid, onFormChange, validate } = useForm({
    Domain: '',
    Name: '',
    SupportEmail: '',
    TechnicalEmail: '',
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
      const { Domain, Name, SupportEmail, TechnicalEmail, DataRequired } = response;
      setFields({
        ...fields,
        ...{
          Domain: Domain || '',
          Name: Name || '',
          SupportEmail: SupportEmail || '',
          TechnicalEmail: TechnicalEmail || '',
        },
      });
      setEditMode(DataRequired);
      setDataRequired(DataRequired);
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
                error={!!errorObj.Name}
                helperText={errorObj.Name}
                size="small"
                name="Name"
                label="Adserver's name"
                value={fields.Name}
                type="text"
                required
                inputProps={{ autoComplete: 'off' }}
              />
              <TextField
                className={styles.textField}
                error={!!errorObj.Domain}
                helperText={errorObj.Domain}
                size="small"
                name="Domain"
                label="Adserver's domain"
                value={fields.Domain}
                type="text"
                required
                inputProps={{ autoComplete: 'off' }}
              />
            </Box>
            <Box className={styles.formBlock}>
              <TextField
                className={styles.textField}
                error={!!errorObj.SupportEmail}
                helperText={errorObj.SupportEmail}
                size="small"
                name="SupportEmail"
                label="Support email"
                value={fields.SupportEmail}
                type="email"
                placeholder="support@domain.xyz"
                required
                inputProps={{ autoComplete: 'off' }}
              />
              <TextField
                className={styles.textField}
                error={!!errorObj.TechnicalEmail}
                helperText={errorObj.TechnicalEmail}
                size="small"
                name="TechnicalEmail"
                label="Technical email"
                value={fields.TechnicalEmail}
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
          <TableCell align="left">{stepData.Name}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="left">Domain</TableCell>
          <TableCell align="left">{stepData.Domain}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="left">Email to support</TableCell>
          <TableCell align="left">{stepData.SupportEmail}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="left">AdServer's operator email</TableCell>
          <TableCell align="left">{stepData.TechnicalEmail}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
