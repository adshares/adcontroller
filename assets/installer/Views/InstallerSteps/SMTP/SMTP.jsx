import React, { useEffect, useState } from 'react'
import apiService from '../../../utils/apiService'
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField
} from '@mui/material'
import styles from './styles.scss'
import WindowCard from '../../../Components/WindowCard/WindowCard'
import { useForm } from '../../../hooks/hooks'

const SMTP = ({ handleNextStep, handlePrevStep, step }) => {
  const [isLoading, setIsLoading] = useState(true)
  const { fields, isFormValid, errorObj, onFormChange, setFields, validate } = useForm({
    smtp_host: '',
    smtp_port: '',
    smtp_sender: '',
    smtp_username: '',
  })
  const [isDataRequired, setIsDataRequired] = useState(true)
  const [editMode, setEditMode] = useState(isDataRequired)
  const {
    fields: newPassword,
    onFormChange: onPasswordChange,
    isFormValid: isPasswordFormValid,
    validate: passwordValidate,
    errorObj: passwordErrObj
  } = useForm({ smtp_password: '' })
  useEffect(() => {
    getStepData().catch(error => console.log(error))
  }, [])

  const getStepData = async () => {
    setIsLoading(true)
    const response = await apiService.getCurrentStepData(step.path)
    setIsDataRequired(response.data_required)
    setEditMode(response.data_required)
    setFields({
      smtp_host: response.smtp_host,
      smtp_port: response.smtp_port,
      smtp_sender: response.smtp_sender,
      smtp_username: response.smtp_username,
    })
    setIsLoading(false)
  }

  const handleSubmit = async () => {
    if (!editMode) {
      await apiService.sendStepData(step.path, {})
      handleNextStep(step)
      setIsLoading(false)
      return
    }
    if (!isFormValid) {
      return
    }
    setIsLoading(true)
    await apiService.sendStepData(step.path, { ...fields, ...newPassword })
    handleNextStep(step)
    setIsLoading(false)
  }

  return (
    <WindowCard
      dataLoading={isLoading}
      title="SMTP information"
      onNextClick={handleSubmit}
      disabledNext={isDataRequired ? !isFormValid || !isPasswordFormValid : !isFormValid}
      onBackClick={() => handlePrevStep(step)}
    >
      {editMode && (
        <>
          {!isDataRequired &&
            <Box className={styles.editButtonThumb}>
              <Button
                onClick={() => (setEditMode(false))}
                type="button"
              >
                Cancel
              </Button>
            </Box>}
          <Box className={styles.container}>
            <Box
              className={styles.formBlock}
              component="form"
              onChange={onFormChange}
              onBlur={(e) => validate(e.target)}
            >
              <TextField
                className={styles.textField}
                error={!!errorObj.smtp_host}
                helperText={errorObj.smtp_host}
                name='smtp_host'
                value={fields.smtp_host}
                label='SMTP host'
                size="small"
                type="text"
                fullWidth
              />
              <TextField
                className={styles.textField}
                error={!!errorObj.smtp_port}
                helperText={errorObj.smtp_port}
                name='smtp_port'
                value={fields.smtp_port}
                label='SMTP port'
                size="small"
                type="text"
                fullWidth
              />
              <TextField
                className={styles.textField}
                error={!!errorObj.smtp_sender}
                helperText={errorObj.smtp_sender}
                name='smtp_sender'
                value={fields.smtp_sender}
                label='SMTP sender'
                size="small"
                type="text"
                fullWidth
              />
              <TextField
                className={styles.textField}
                error={!!errorObj.smtp_username}
                helperText={errorObj.smtp_username}
                name='smtp_username'
                value={fields.smtp_username}
                label='SMTP username'
                size="small"
                type="text"
                fullWidth
              />
            </Box>
            <Box
              className={styles.formBlock}
              component="form"
              onChange={onPasswordChange}
              onBlur={(e) => passwordValidate(e.target)}

            >
              <TextField
                error={isDataRequired && !!passwordErrObj.smtp_password}
                helperText={isDataRequired && passwordErrObj.smtp_password}
                className={styles.textField}
                value={newPassword.smtp_password}
                name="smtp_password"
                size="small"
                label="New password"
                type="password"
                fullWidth
              />
            </Box>
          </Box>
        </>
      )}

      {!editMode && (
        <>
          <Box className={styles.editButtonThumb}>
            <Button
              onClick={() => (setEditMode(true))}
              type="button"
            >
              Edit
            </Button>
          </Box>
          <InfoTable stepData={fields}/>
        </>
      )}

    </WindowCard>
  )
}

export default SMTP

const InfoTable = ({ stepData }) => {
  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell align="left">SMTP host</TableCell>
          <TableCell align="left">{stepData.smtp_host}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="left">SMTP port</TableCell>
          <TableCell align="left">{stepData.smtp_port}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="left">SMTP sender</TableCell>
          <TableCell align="left">{stepData.smtp_sender}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="left">SMTP username</TableCell>
          <TableCell align="left">{stepData.smtp_username} ADS</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
