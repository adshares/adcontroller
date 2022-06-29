import React, { useEffect, useState } from 'react'
import apiService from '../../../utils/apiService'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import styles from '../styles.scss'
import { WindowCard } from '../../../Components/WindowCard/WindowCard'

const Classifier = ({handleNextStep, handlePrevStep, step}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [stepData, setStepData] = useState({})

  useEffect(() => {
    setIsLoading(true)
    apiService.getCurrentStepData(step.path).then(response => {
      setStepData({...stepData, ...response })
      setIsLoading(false)
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const response = await apiService.sendStepData('classifier', stepData)
    console.log(response)
    handleNextStep(step)
  }

  console.log(stepData)

  return (
    isLoading ?
      <Box className={styles.spinner} >
        <CircularProgress/>
      </Box> :
      <WindowCard title='Classifier information'>
        <div className={styles.formControl}>
          {step.index > 1 && <Button onClick={() => handlePrevStep(step)} type='button' variant='outlined'>Back</Button> }
          <Button onClick={handleSubmit} type='submit' variant='contained'>Save</Button>
        </div>
      </WindowCard>
  )
}

export default Classifier
