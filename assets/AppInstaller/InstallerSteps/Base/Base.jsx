import React, { useEffect, useState } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material';
import { useForm, useCreateNotification } from '../../../hooks';
import apiService from '../../../utils/apiService';
import InstallerStepWrapper from '../../../Components/InstallerStepWrapper/InstallerStepWrapper';
import commonStyles from '../../../styles/commonStyles.scss';

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
  const { createErrorNotification } = useCreateNotification();
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
      createErrorNotification(err);
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
      if (dataRequired || Object.keys(form.touchedFields).some((field) => form.touchedFields[field])) {
        await apiService.sendStepData(step.path, {
          ...form.fields,
        });
      }
      handleNextStep(step);
    } catch (err) {
      createErrorNotification(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <InstallerStepWrapper
      dataLoading={isLoading}
      title="Base information"
      onNextClick={handleSubmit}
      disabledNext={!form.isFormValid}
      hideBackButton
    >
      <Box className={`${commonStyles.flex} ${commonStyles.justifyFlexEnd}`}>
        <Button sx={{ visibility: dataRequired ? 'hidden' : 'visible' }} onClick={() => setEditMode(!editMode)} type="button">
          {editMode ? 'CANCEL' : 'EDIT'}
        </Button>
      </Box>

      {editMode && (
        <Box
          className={`${commonStyles.flex} ${commonStyles.justifySpaceBetween}`}
          component="form"
          onChange={form.onChange}
          onFocus={form.setTouched}
          onSubmit={(e) => e.preventDefault()}
        >
          <Box sx={{ width: '380px' }}>
            <TextField
              sx={{ mb: 3 }}
              customvariant="highLabel"
              color="secondary"
              fullWidth
              error={form.touchedFields.Name && !form.errorObj.Name.isValid}
              helperText={form.touchedFields.Name && form.errorObj.Name.helperText}
              name="Name"
              label="Adserver's name"
              value={form.fields.Name}
              type="text"
              required
              inputProps={{ autoComplete: 'off' }}
            />
            <TextField
              customvariant="highLabel"
              color="secondary"
              fullWidth
              error={form.touchedFields.Domain && !form.errorObj.Domain.isValid}
              helperText={form.touchedFields.Domain && form.errorObj.Domain.helperText}
              name="Domain"
              label="Adserver's domain"
              value={form.fields.Domain}
              type="text"
              required
              inputProps={{ autoComplete: 'off' }}
            />
          </Box>
          <Box sx={{ width: '380px' }}>
            <TextField
              sx={{ mb: 3 }}
              customvariant="highLabel"
              color="secondary"
              fullWidth
              error={form.touchedFields.SupportEmail && !form.errorObj.SupportEmail.isValid}
              helperText={form.touchedFields.SupportEmail && form.errorObj.SupportEmail.helperText}
              name="SupportEmail"
              label="Support email"
              value={form.fields.SupportEmail}
              type="email"
              placeholder="support@domain.xyz"
              required
              inputProps={{ autoComplete: 'off' }}
            />
            <TextField
              customvariant="highLabel"
              color="secondary"
              fullWidth
              error={form.touchedFields.TechnicalEmail && !form.errorObj.TechnicalEmail.isValid}
              helperText={form.touchedFields.TechnicalEmail && form.errorObj.TechnicalEmail.helperText}
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
          <TableCell align="left">
            <Typography variant="tableAssetsText">Adserver's name</Typography>{' '}
          </TableCell>
          <TableCell align="left">
            <Typography variant="tableAssetsText">{stepData.Name}</Typography>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="left">
            <Typography variant="tableAssetsText">Adserver's domain</Typography>
          </TableCell>
          <TableCell align="left">
            <Typography variant="tableAssetsText">{stepData.Domain}</Typography>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="left">
            <Typography variant="tableAssetsText">Support email</Typography>
          </TableCell>
          <TableCell align="left">
            <Typography variant="tableAssetsText">{stepData.SupportEmail}</Typography>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="left">
            <Typography variant="tableAssetsText">Technical email</Typography>
          </TableCell>
          <TableCell align="left">
            <Typography variant="tableAssetsText">{stepData.TechnicalEmail}</Typography>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
