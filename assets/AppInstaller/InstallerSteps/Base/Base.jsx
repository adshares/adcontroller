import React, { useEffect, useState } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableRow, TextField } from '@mui/material';
import { useForm } from '../../../hooks';
import apiService from '../../../utils/apiService';
import InstallerStepWrapper from '../../../Components/InstallerStepWrapper/InstallerStepWrapper';
import styles from './styles.scss';

function Base({ handleNextStep, step }) {
  const [isLoading, setIsLoading] = useState(true);
  const form = useForm({
    initialFields: {
      Domain: '',
      Name: '',
      SupportEmail: '',
      TechnicalEmail: '',
    },
    validation: {
      Domain: ['required', 'domain'],
      Name: ['required'],
      SupportEmail: ['required', 'email'],
      TechnicalEmail: ['required', 'email'],
    },
  });
  const [editMode, setEditMode] = useState(false);
  const [dataRequired, setDataRequired] = useState(false);
  const [alert, setAlert] = useState({
    type: '',
    message: '',
    title: '',
  });

  useEffect(() => {
    getStepData();
  }, []);

  const getStepData = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCurrentStepData(step.path);
      const { Domain, Name, SupportEmail, TechnicalEmail, DataRequired } = response;
      form.setFields({
        ...form.fields,
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
      if (Object.keys(form.touchedFields).some((field) => form.touchedFields[field])) {
        await apiService.sendStepData(step.path, {
          ...form.fields,
        });
      }
      handleNextStep(step);
    } catch (err) {
      console.log(err);
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
      disabledNext={!form.isFormValid}
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
            onChange={form.onChange}
            onFocus={form.setTouched}
            onSubmit={(e) => e.preventDefault()}
          >
            <Box className={styles.formBlock}>
              <TextField
                className={styles.textField}
                error={form.touchedFields.Name && !form.errorObj.Name.isValid}
                helperText={form.touchedFields.Name && form.errorObj.Name.helperText}
                size="small"
                name="Name"
                label="Adserver's name"
                value={form.fields.Name}
                type="text"
                required
                inputProps={{ autoComplete: 'off' }}
              />
              <TextField
                className={styles.textField}
                error={form.touchedFields.Domain && !form.errorObj.Domain.isValid}
                helperText={form.touchedFields.Domain && form.errorObj.Domain.helperText}
                size="small"
                name="Domain"
                label="Adserver's domain"
                value={form.fields.Domain}
                type="text"
                required
                inputProps={{ autoComplete: 'off' }}
              />
            </Box>
            <Box className={styles.formBlock}>
              <TextField
                className={styles.textField}
                error={form.touchedFields.SupportEmail && !form.errorObj.SupportEmail.isValid}
                helperText={form.touchedFields.SupportEmail && form.errorObj.SupportEmail.helperText}
                size="small"
                name="SupportEmail"
                label="Support email"
                value={form.fields.SupportEmail}
                type="email"
                placeholder="support@domain.xyz"
                required
                inputProps={{ autoComplete: 'off' }}
              />
              <TextField
                className={styles.textField}
                error={form.touchedFields.TechnicalEmail && !form.errorObj.TechnicalEmail.isValid}
                helperText={form.touchedFields.TechnicalEmail && form.errorObj.TechnicalEmail.helperText}
                size="small"
                name="TechnicalEmail"
                label="Technical email"
                value={form.fields.TechnicalEmail}
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
            ...form.fields,
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
          <TableCell align="left">Adserver's name</TableCell>
          <TableCell align="left">{stepData.Name}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="left">Adserver's domain</TableCell>
          <TableCell align="left">{stepData.Domain}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="left">Support email</TableCell>
          <TableCell align="left">{stepData.SupportEmail}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="left">Technical email</TableCell>
          <TableCell align="left">{stepData.TechnicalEmail}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
