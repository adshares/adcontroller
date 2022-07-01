import React, { useEffect, useState } from 'react'
import apiService from '../../../utils/apiService'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import styles from '../Base/styles.scss'
import WindowCard from '../../../Components/WindowCard/WindowCard'

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

      </WindowCard>
  )
}

export default Classifier
