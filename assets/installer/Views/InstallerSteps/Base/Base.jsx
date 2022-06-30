import React, { useEffect, useState } from 'react'
import { useForm } from '../../../hooks/hooks'
import apiService from '../../../utils/apiService'
import WindowCard from '../../../Components/WindowCard/WindowCard'
import Spinner from '../../../Components/Spiner/Spinner'
import { Box, Button, Collapse, TextField, } from '@mui/material'
import styles from './styles.scss'

const Base = ({handleNextStep, step}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const {fields, errorObj, setFields, isFormValid, onFormChange, validate} = useForm({
    base_adpanel_host_prefix: '',
    base_adserver_host_prefix: '',
    base_adserver_name: '',
    base_aduser_host_prefix: '',
    base_contact_email: '',
    base_domain: '',
    base_support_email: '',
  })

  useEffect(() => {
    getStepData().catch(error => console.log(error))
  },[])

  const getStepData = async () => {
    setIsLoading(true)
    const response = await apiService.getCurrentStepData(step.path)
    setIsLoading(false)
    setFields({...fields, ...response})
  }

  const handleSubmit = async () => {
    if(!isFormValid){
      return
    }
    setIsLoading(true)
    await apiService.sendStepData(step.path, fields)
    handleNextStep(step)
    setIsLoading(false)
  }

  return (
    <WindowCard
      title='Base information'
      onNextClick={handleSubmit}
      disabledNext={!isFormValid || isLoading}
      isFirstCard
    >
      {isLoading ?
        <Spinner/> :
        <Box
          component='form'
          className={styles.container}
          onChange={onFormChange}
          onBlur={(e) => validate(e.target)}
        >
          <Box className={styles.formBase}>
            <Box className={styles.formBlock}>
              <TextField
                className={styles.textField}
                error={!!errorObj.base_adserver_name}
                helperText={errorObj.base_adserver_name}
                size="small"
                name="base_adserver_name"
                label="Adserver name"
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

          <Box className={styles.formAdvanced} >
            <Button type='button' onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}>Advanced options</Button>
            <Collapse in={showAdvancedOptions}  timeout="auto" unmountOnExit>
              <Box sx={{marginTop: '8px'}} className={styles.formBlock}>
              <TextField
                className={styles.textField}
                error={!!errorObj.base_adpanel_host_prefix}
                helperText={errorObj.base_adpanel_host_prefix}
                size="small"
                name="base_adpanel_host_prefix"
                label="Adpanel host prefix"
                value={fields.base_adpanel_host_prefix}
                type="text"
                required
              />
              <TextField
                className={styles.textField}
                error={!!errorObj.base_aduser_host_prefix}
                helperText={errorObj.base_aduser_host_prefix}
                size="small"
                name="base_aduser_host_prefix"
                label="Aduser host prefix"
                value={fields.base_aduser_host_prefix}
                type="text"
                required
              />
              <TextField
                className={styles.textField}
                error={!!errorObj.base_adserver_host_prefix}
                helperText={errorObj.base_adserver_host_prefix}
                size="small"
                name="base_adserver_host_prefix"
                label="Adserver host prefix"
                value={fields.base_adserver_host_prefix}
                type="text"
                required
              />
              </Box>
            </Collapse>
          </Box>
        </Box>
      }
    </WindowCard>
  )
}

export default Base
