import React, { useEffect, useState } from 'react'
import apiService from '../../../utils/apiService'
import WindowCard from '../../../Components/WindowCard/WindowCard'
import Spinner from '../../../Components/Spiner/Spinner'
import { Box, Button, Collapse, TextField, } from '@mui/material'
import styles from '../styles.scss'

const Base = ({handleNextStep, step}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [stepData, setStepData] = useState({
    data_required: true,
    base_adserver_name: '',
    base_domain: '',
    base_support_email: '',
    base_contact_email: '',
    base_adpanel_host_prefix: '',
    base_adserver_host_prefix: '',
    base_aduser_host_prefix: '',
  })
  const [formErrors, setFormErrors] = useState({
    base_adserver_name: '',
    base_domain: '',
    base_support_email: '',
    base_contact_email: '',
    base_adpanel_host_prefix: '',
    base_adserver_host_prefix: '',
    base_aduser_host_prefix: '',
  })
  const [isFormValid, setIsFormValid] = useState(false)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

  useEffect(() => {
    getStepData().catch(error => console.log(error))
  },[])

  useEffect(() => {
    checkIsFormValid()
  }, [stepData, formErrors])

  const getStepData = async () => {
    setIsLoading(true)
    const response = await apiService.getCurrentStepData(step.path)
    setIsLoading(false)
    setStepData({...stepData, ...response})
  }

  const checkIsFormValid = () => {
    const isEmptyFields = Object.keys(stepData).some(el => {
      if(el === 'data_required'){
        return
      }
      return !stepData[el]
    })
    const isFormErrors = Object.keys(formErrors).some(el => !!formErrors[el])
    setIsFormValid(!isEmptyFields && !isFormErrors)
  }

  const validate = (target) => {
    const {name, value} = target
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g
    const errors = {}

    if(!name){
      return
    }

    if(!value) {
      errors[name] = 'Required field'
    }
    else if(name === 'base_support_email' || name === 'base_contact_email') {
      if(emailRegex.test(value)){
        errors[name] = ''
      }
      else {
        errors[name] = 'Field must be an email'
      }
    } else {
      errors[name] = ''
    }

    setFormErrors({ ...formErrors, ...errors })
  }

  const onFormChange = (e) => {
    const {name, value} = e.target
    setStepData({...stepData, [name]: value})
    validate(e.target)
  }

  const handleSubmit = async () => {
    if(!isFormValid){
      return
    }
    setIsLoading(true)
    await apiService.sendStepData(step.path, stepData)
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
                error={!!formErrors.base_adserver_name}
                helperText={formErrors.base_adserver_name}
                size="small"
                name="base_adserver_name"
                label="Adserver name"
                value={stepData.base_adserver_name}
                type="text"
                required
              />
              <TextField
                className={styles.textField}
                error={!!formErrors.base_domain}
                helperText={formErrors.base_domain}
                size="small"
                name="base_domain"
                label="Domain name"
                value={stepData.base_domain}
                type="text"
                required
              />
            </Box>
            <Box className={styles.formBlock}>
              <TextField
                className={styles.textField}
                error={!!formErrors.base_support_email}
                helperText={formErrors.base_support_email}
                size="small"
                name="base_support_email"
                label="Email to support"
                value={stepData.base_support_email}
                type="email"
                placeholder="support@domain.xyz"
                required
              />
              <TextField
                className={styles.textField}
                error={!!formErrors.base_contact_email}
                helperText={formErrors.base_contact_email}
                size="small"
                name="base_contact_email"
                label="Email to contact"
                value={stepData.base_contact_email}
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
                error={!!formErrors.base_adpanel_host_prefix}
                helperText={formErrors.base_adpanel_host_prefix}
                size="small"
                name="base_adpanel_host_prefix"
                label="Adpanel host prefix"
                value={stepData.base_adpanel_host_prefix}
                type="text"
                required
              />
              <TextField
                className={styles.textField}
                error={!!formErrors.base_aduser_host_prefix}
                helperText={formErrors.base_aduser_host_prefix}
                size="small"
                name="base_aduser_host_prefix"
                label="Aduser host prefix"
                value={stepData.base_aduser_host_prefix}
                type="text"
                required
              />
              <TextField
                className={styles.textField}
                error={!!formErrors.base_adserver_host_prefix}
                helperText={formErrors.base_adserver_host_prefix}
                size="small"
                name="base_adserver_host_prefix"
                label="Adserver host prefix"
                value={stepData.base_adserver_host_prefix}
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
