import React, { useEffect, useState } from 'react'
import apiService from '../../../utils/apiService'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import styles from '../Base/styles.scss'
import { WindowCard } from '../../../Components/WindowCard/WindowCard'

const Status = ({handleNextStep, handlePrevStep, step}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [stepData, setStepData] = useState({
    adclassify: {module: null, version: null, url: null, code: null},
    adpanel: {module: null, version: null, url: null, code: null},
    adpay: {module: null, version: null, url: null, code: null},
    adselect: {module: null, version: null, url: null, code: null},
    adserver: {module: null, version: null, url: null, code: null},
    aduser: {module: null, version: null, url: null, code: null},
    data_required: false
  })

  useEffect(() => {
    setIsLoading(true)
    apiService.getCurrentStepData(step.path).then(response => {
      setStepData({...stepData, ...response })
      setIsLoading(false)
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await apiService.sendStepData('status', stepData)
    handleNextStep(step)
  }

  console.log(stepData)

  return (
    isLoading ?
      <Box className={styles.spinner} >
        <CircularProgress/>
      </Box> :
      <WindowCard title='SMTP information'>
        <Typography variant='body1'>
          {stepData.adclassify.module} - version: {stepData.adclassify.version} - {stepData.adclassify.url} - {stepData.adclassify.code}
        </Typography>
        <Typography variant='body1'>
          {stepData.adpanel.module} - version: {stepData.adpanel.version} - {stepData.adpanel.url} - {stepData.adpanel.code}
        </Typography>
        <Typography variant='body1'>
          {stepData.adpay.module} - version: {stepData.adpay.version} - {stepData.adpay.url} - {stepData.adpay.code}
        </Typography>
        <Typography variant='body1'>
          {stepData.adserver.module} - version: {stepData.adserver.version} - {stepData.adserver.url} - {stepData.adserver.code}
        </Typography>
        <Typography variant='body1'>
          {stepData.adserver.module} - version: {stepData.adserver.version} - {stepData.adserver.url} - {stepData.adserver.code}
        </Typography>
        <Typography variant='body1'>
          {stepData.aduser.module} - version: {stepData.aduser.version} - {stepData.aduser.url} - {stepData.aduser.code}
        </Typography>
        <div className={styles.formControl}>
          {step.index > 1 && <Button onClick={() => handlePrevStep(step)} type='button' variant='outlined'>Back</Button> }
          <Button onClick={handleSubmit} type='submit' variant='contained'>Save</Button>
        </div>
      </WindowCard>
  )
}

export default Status
