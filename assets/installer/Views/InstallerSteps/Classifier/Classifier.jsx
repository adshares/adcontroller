import React, { useEffect, useState } from 'react'
import apiService from '../../../utils/apiService'
import WindowCard from '../../../Components/WindowCard/WindowCard'
import { Box, Typography } from '@mui/material'
import styles from './styles.scss'

const Classifier = ({ handleNextStep, handlePrevStep, step }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [stepData, setStepData] = useState({})

  useEffect(() => {
    getStepData().catch(error => console.log(error))
  }, [])

  const getStepData = async () => {
    setIsLoading(true)
    const response = await apiService.getCurrentStepData(step.path)
    setIsLoading(false)
    setStepData({ ...stepData, ...response })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await apiService.sendStepData(step.path, {})
    handleNextStep(step)
  }

  return (
    <WindowCard
      dataLoading={isLoading}
      title="Classifier information"
      onNextClick={handleSubmit}
      disabledNext={false}
      onBackClick={() => handlePrevStep(step)}
    >

      <Box className={styles.container}>
        <Typography variant="h5">
          Registration in AdClassify
        </Typography>
      </Box>

    </WindowCard>
  )
}

export default Classifier


