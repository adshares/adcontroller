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
import styles from '../Base/styles.scss'
import WindowCard  from '../../../Components/WindowCard/WindowCard'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const License = ({handleNextStep, handlePrevStep, step}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [stepData, setStepData] = useState({
    base_adserver_name: null,
    license_contact_email: null,
    license_end_date: null,
    license_start_date: null,
    license_owner: null,
    license_type: null
  })
  const [licenseKey, setLicenseKey] = useState('')

  useEffect(() => {
    setIsLoading(false)
    getStepData().catch(error => console.log(error))
  }, [])

  console.log(stepData)

  const getStepData = async () => {
    setIsLoading(true)
    const response = await apiService.getCurrentStepData(step.path)
    setStepData({ ...stepData, ...response})
    setIsLoading(false)
  }

  const createLicense = async () => {
    const response = await apiService.sendStepData(step.path, {license_contact_email: stepData.license_contact_email})
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
    if(stepData.license_start_date){
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

  const conditionalRender = (isLicenseExist) => {

    return isLicenseExist ? (
      <>
        <Typography variant='body1'>
          License owner: {stepData.license_owner}
        </Typography>

        {/* TODO warunek na email*/}
        <Typography variant='body1'>
          Contact email: {stepData.license_contact_email}
        </Typography>
        <Typography variant='body1'>
          License start date: {stepData.license_start_date}
        </Typography>
        <Typography variant='body1'>
          License end date: {stepData.license_end_date}
        </Typography>
        <Typography variant='body1'>
          License type: {stepData.license_type}
        </Typography>
      </>
    ) :
    (
      <>
            <Typography variant='body1'>
              Adserver name: {stepData.base_adserver_name}
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
                value={stepData.license_contact_email}
                type='email'
                required
              />
              <Button type='submit' variant='contained'>Create</Button>
            </form>


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

      </>
      )
  }

  return (
      <WindowCard
        title='License information'
        onBackClick={() => handlePrevStep(step)}
      >
        {isLoading ?
          <Box className={styles.spinner}>
            <CircularProgress/>
          </Box> :
          conditionalRender(!!stepData.license_start_date)
        }
      </WindowCard>
  )
}

export default License
