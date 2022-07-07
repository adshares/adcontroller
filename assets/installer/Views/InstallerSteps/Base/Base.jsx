import React, { useEffect, useState } from 'react'
import { useForm } from '../../../hooks/hooks'
import apiService from '../../../utils/apiService'
import WindowCard from '../../../Components/WindowCard/WindowCard'
import { Box, Button, Collapse, Table, TableBody, TableCell, TableRow, TextField, } from '@mui/material'
import styles from './styles.scss'

const Base = ({ handleNextStep, step }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const { fields, errorObj, setFields, isFormValid, onFormChange, validate } = useForm({
    base_adserver_name: '',
    base_contact_email: '',
    base_domain: '',
    base_support_email: '',
  })
  const { fields: advancedFields, setFields: setAdvancedFields, onFormChange: onAdvancedFieldsChange } = useForm({
    base_adpanel_host_prefix: '',
    base_adserver_host_prefix: '',
    base_aduser_host_prefix: '',
  })
  const [editMode, setEditMode] = useState(false)
  const [dataRequired, setDataRequired] = useState(false)
  const [alert, setAlert] = useState({type: '', message: ''})

  useEffect(() => {
    getStepData().catch(error => console.log(error))
  }, [])

  const getStepData = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getCurrentStepData(step.path)
      const {
        base_adserver_name,
        base_contact_email,
        base_domain,
        base_support_email,
        base_adpanel_host_prefix,
        base_adserver_host_prefix,
        base_aduser_host_prefix,
        data_required
      } = response
      setFields({
        ...fields,
        ...{
          base_adserver_name: base_adserver_name || '',
          base_contact_email: base_contact_email || '',
          base_domain: base_domain || '',
          base_support_email: base_support_email || ''
        }
      })
      setAdvancedFields({ ...advancedFields, ...{ base_adpanel_host_prefix, base_adserver_host_prefix, base_aduser_host_prefix} })
      setEditMode(data_required)
      setDataRequired(data_required)
    } catch (err) {
      console.log(err)
      setAlert({
        type: 'error',
        message: err.data.message,
        title: err.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      if (!editMode) {
        handleNextStep(step)
        return
      }
      await apiService.sendStepData(step.path, { ...fields, ...advancedFields })
      handleNextStep(step)
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.data.message,
        title: err.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <WindowCard
      alert={alert}
      dataLoading={isLoading}
      title="Base information"
      onNextClick={handleSubmit}
      disabledNext={!isFormValid}
      isFirstCard
    >
      <Box className={styles.editButtonThumb}>
        <Button
          className={(dataRequired ? styles.hidden : styles.visible)}
          onClick={() => (setEditMode(!editMode))}
          type="button"
        >
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
              />
              <TextField
                className={styles.textField}
                error={!!errorObj.base_contact_email}
                helperText={errorObj.base_contact_email}
                size="small"
                name="base_contact_email"
                label="Email to contact"
                value={fields.base_contact_email}
                type="email"
                placeholder="tech@domain.xyz"
                required
              />
            </Box>
          </Box>

          <Button type="button" onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}>Advanced options</Button>

          <Box
            className={styles.formAdvanced}
            component="form"
            onChange={onAdvancedFieldsChange}
          >
            <Collapse in={showAdvancedOptions} timeout="auto" unmountOnExit>
              <Box sx={{ marginTop: '8px' }} className={styles.formBlock}>
                <TextField
                  className={styles.textField}
                  size="small"
                  name="base_adpanel_host_prefix"
                  label="AdPanel host prefix"
                  value={advancedFields.base_adpanel_host_prefix}
                  type="text"
                />
                <TextField
                  className={styles.textField}
                  size="small"
                  name="base_aduser_host_prefix"
                  label="AdUser host prefix"
                  value={advancedFields.base_aduser_host_prefix}
                  type="text"
                />
                <TextField
                  className={styles.textField}
                  size="small"
                  name="base_adserver_host_prefix"
                  label="AdServer host prefix"
                  value={advancedFields.base_adserver_host_prefix}
                  type="text"
                />
              </Box>
            </Collapse>
          </Box>
        </Box>
      )}

      {!editMode && (
        <InfoTable stepData={{ ...fields, ...advancedFields }}/>
      )}

    </WindowCard>
  )
}

export default Base

const InfoTable = ({ stepData }) => {
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
          <TableCell align="left">Email to contact</TableCell>
          <TableCell align="left">{stepData.base_contact_email}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="left">AdPanel host prefix</TableCell>
          <TableCell align="left">{stepData.base_adpanel_host_prefix}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="left">AdUser host prefix</TableCell>
          <TableCell align="left">{stepData.base_aduser_host_prefix}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="left">AdServer host prefix</TableCell>
          <TableCell align="left">{stepData.base_adserver_host_prefix}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
