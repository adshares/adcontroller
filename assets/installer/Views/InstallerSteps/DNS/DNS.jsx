import React, { useState, useEffect } from 'react'
import apiService from '../../../utils/apiService'
import { WindowCard } from '../../../Components/WindowCard/WindowCard'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import styles from '../styles.scss'

const DNS = ({handleNextStep, handlePrevStep, step}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [stepData, setStepData] = useState({
    base_domain: '',
  })
  useEffect(() => {
    setIsLoading(true)
    apiService.getCurrentStepData('dns').then(response => {
      setStepData({...stepData, ...response })
      setIsLoading(false)
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await apiService.sendStepData('dns', stepData)
    handleNextStep(step)
  }

  return (
    isLoading ?
      <Box className={styles.spinner} >
        <CircularProgress/>
      </Box> :
    <WindowCard title='DNS information'>
      <Typography variant='body1'>
        Base domain address: {stepData.base_domain}
      </Typography>
      <div className={styles.formControl}>
        {step.index > 1 && <Button onClick={() => handlePrevStep(step)} type='button' variant='outlined'>Back</Button> }
        <Button onClick={handleSubmit} type='submit' variant='contained'>Save</Button>
      </div>
    </WindowCard>
  )
}

export default DNS
