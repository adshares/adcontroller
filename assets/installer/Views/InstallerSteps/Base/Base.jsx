import React, { useEffect, useState } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { WindowCard } from '../../../Components/WindowCard/WindowCard'

import styles from '../styles.scss'
import apiService from '../../../utils/apiService'

const Base = ({handleNextStep, handlePrevStep, step}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [stepData, setStepData] = useState({
    base_adserver_name: '',
    base_domain: '',
    base_support_email: '',
    base_contact_email: '',
    base_adpanel_host_prefix: '',
    base_adserver_host_prefix: '',
    base_aduser_host_prefix: '',
  })

  useEffect(() => {
    setIsLoading(true)
    apiService.getCurrentStepData('base').then(response => {
      setStepData({...stepData, ...response })
      setIsLoading(false)
    })
  }, [])

  const onFormChange = (e) => {
    const {name, value} = e.target
    setStepData({...stepData, [name]: value})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await apiService.sendStepData('base', stepData)
    handleNextStep(step)
  }
  return (
    isLoading ?
    <Box className={styles.spinner} >
      <CircularProgress/>
    </Box> :
    <WindowCard title='Base information'>
        <form
          className={styles.form}
          onChange={onFormChange}
          onSubmit={handleSubmit}
        >
          <TextField
            margin='normal'
            size='small'
            name='base_adserver_name'
            label='Adserver name'
            value={stepData.base_adserver_name}
            type='text'
            required
          />
          <TextField
            margin='normal'
            size='small'
            name='base_domain'
            label='Domain name'
            value={stepData.base_domain}
            type='text'
            required
          />
          <TextField
            margin='normal'
            size='small'
            name='base_support_email'
            label='Email to support'
            value={stepData.base_support_email}
            type='email'
            placeholder='support@domain'
            required
          />
          <TextField
            margin='normal'
            size='small'
            name='base_contact_email'
            label='Email to contact'
            value={stepData.base_contact_email}
            type='email'
            placeholder='tech@domain'
            required
          />
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>Advanced options</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div className={styles.form}>
                <TextField
                  margin='normal'
                  size='small'
                  name='base_adpanel_host_prefix'
                  label='Adpanel host prefix'
                  value={stepData.base_adpanel_host_prefix}
                  type='text'
                  required
                />
                <TextField
                  margin='normal'
                  size='small'
                  name='base_aduser_host_prefix'
                  label='Aduser host prefix'
                  value={stepData.base_aduser_host_prefix}
                  type='text'
                  required
                />
                <TextField
                  margin='normal'
                  size='small'
                  name='base_adserver_host_prefix'
                  label='Adserver host prefix'
                  value={stepData.base_adserver_host_prefix}
                  type='text'
                  required
                />
              </div>
            </AccordionDetails>
          </Accordion>
          <div className={styles.formControl}>
            {step.index > 1 && <Button onClick={() => handlePrevStep(step)} type='button' variant='outlined'>Back</Button> }
            <Button type='submit' variant='contained'>Save</Button>
          </div>
        </form>
    </WindowCard>
  )
}

export default Base
