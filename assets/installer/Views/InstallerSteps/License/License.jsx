import React, { useEffect, useState } from 'react'
import apiService from '../../../utils/apiService'
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
import styles from '../styles.scss'
import { WindowCard } from '../../../Components/WindowCard/WindowCard'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const License = ({handleNextStep, handlePrevStep, step}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [stepData, setStepData] = useState({
    adserverName: null,
    contactEmail: null,
    endDate: null,
    startDate: null,
    owner: null,
    type: null
  })
  const [licenseKey, setLicenseKey] = useState('')

  useEffect(() => {
    setIsLoading(false)
    getStepData().catch(error => console.log(error))
  }, [])

  console.log(stepData)

  const getStepData = async () => {
    setIsLoading(true)
    const {
      base_adserver_name: adserverName,
      license_contact_email: contactEmail,
      license_end_date: endDate,
      license_start_date: startDate,
      license_owner: owner,
      license_type: type
    } = await apiService.getCurrentStepData(step.path)
    setStepData({
      ...stepData,
      adserverName,
      contactEmail,
      endDate,
      startDate,
      owner,
      type
    })
    setIsLoading(false)
  }

  const createLicense = async () => {
    const response = await apiService.sendStepData(step.path, {license_contact_email: stepData.contactEmail})
    if (response.message){
      setIsLoading(true)
      await getStepData()
      setIsLoading(false)
    }
  }

  const getLicenseByKey = async () => {
    const response = await apiService.sendStepData(step.path, {license_key: licenseKey})
    console.log(response)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log(e.target.id)
    switch (e.target.id){
      case 'createLicense':
        createLicense().catch(error => console.log(error))
        break
      case 'getLicenseByKey':
        getLicenseByKey().catch(error => console.log(error))
        break
      default:
        break
    }
  }

  const onNextClick = () => {
    if(stepData.startDate){
      handleNextStep(step)
    }

  }

  const onFormChange = (e) => {
    const {name, value} = e.target

    switch (name){
      case 'contactEmail':
        setStepData({...stepData, [name]: value})
        break

      case 'licenseKey':
        setLicenseKey(value)
        break
      default:
        break
    }
    console.log(name, value)
  }

  return (
    isLoading ?
      <Box className={styles.spinner} >
        <CircularProgress/>
      </Box> :

      <WindowCard title='License information'>
        {stepData.startDate ? (
          <>
            <Typography variant='body1'>
              License owner: {stepData.owner}
            </Typography>



            {/* TODO warunek na email*/}
            <Typography variant='body1'>
              Contact email: {stepData.contactEmail}
            </Typography>
            <Typography variant='body1'>
              License start date: {stepData.startDate}
            </Typography>
            <Typography variant='body1'>
              License end date: {stepData.endDate}
            </Typography>
            <Typography variant='body1'>
              License type: {stepData.type}
            </Typography>
          </>
        ) : (
          <>
            <Typography variant='body1'>
              Please create license or enter your license key
            </Typography>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
              >
                <Typography>Create license</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant='body1'>
                Adserver name: {stepData.adserverName}
                </Typography>
                <form
                  id='createLicense'
                  className={styles.form}
                  onChange={onFormChange}
                  onSubmit={handleSubmit}
                >
                  <TextField
                    margin='normal'
                    size='small'
                    name='contactEmail'
                    label='License contact email'
                    value={stepData.contactEmail}
                    type='email'
                    required
                  />
                  <Button type='submit' variant='contained'>Create</Button>
                </form>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
              >
                <Typography>Enter license key</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <form
                  id='getLicenseByKey'
                  className={styles.form}
                  onChange={onFormChange}
                  onSubmit={handleSubmit}
                >
                  <TextField
                    margin='normal'
                    size='small'
                    name='licenseKey'
                    label='Your license key'
                    value={licenseKey}
                    type='text'
                  />
                  <Button type='submit' variant='contained'>Get license</Button>
                </form>
              </AccordionDetails>
            </Accordion>
          </>
        )}


        <div className={styles.formControl}>
          {step.index > 1 && <Button onClick={() => handlePrevStep(step)} type='button' variant='outlined'>Back</Button> }
          <Button onClick={onNextClick} type='button' variant='contained'>Next</Button>
        </div>
      </WindowCard>
  )
}

export default License
