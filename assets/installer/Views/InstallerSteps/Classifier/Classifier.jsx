import React, { useEffect, useState } from 'react'
import apiService from '../../../utils/apiService'
import WindowCard from '../../../Components/WindowCard/WindowCard'
import { Box, LinearProgress, Typography } from '@mui/material'
import styles from './styles.scss'

const Classifier = ({ handleNextStep, handlePrevStep, step }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [registrationInProgress, setRegistrationInProgress] = useState(false)
  const [stepData, setStepData] = useState({})
  const [alert, setAlert] = useState({type: '', message: ''})

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
    setRegistrationInProgress(true)
    const response = await apiService.sendStepData(step.path, {})
    if(response.code > 300){
      setAlert({
        type: 'error',
        message: response.message
      })
      setRegistrationInProgress(false)
      return
    }
    setRegistrationInProgress(false)
    handleNextStep(step)
  }

  return (
    <WindowCard
      alert={alert}
      dataLoading={isLoading}
      title="Classifier information"
      onNextClick={handleSubmit}
      disabledNext={registrationInProgress || isLoading}
      onBackClick={() => handlePrevStep(step)}
    >

      <Box className={styles.container}>
        <Typography variant="h5">
          Registration in AdClassify
        </Typography>
        {registrationInProgress && (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        )}
      </Box>

    </WindowCard>
  )
}

export default Classifier


