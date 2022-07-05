import React, { useEffect, useState } from 'react'
import apiService from '../../../utils/apiService'
import WindowCard from '../../../Components/WindowCard/WindowCard'
import Spinner from '../../../Components/Spiner/Spinner'

const Classifier = ({handleNextStep, handlePrevStep, step}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [stepData, setStepData] = useState({})

  useEffect(() => {
    getStepData().catch(error => console.log(error))
  }, [])

  const getStepData = async () => {
    setIsLoading(true)
    const response = await apiService.getCurrentStepData(step.path)
    setIsLoading(false)
    setStepData({...stepData, ...response})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const response = await apiService.sendStepData('classifier', {})
    handleNextStep(step)
  }

  console.log(stepData)

  return (
    <WindowCard
      title='Classifier information'
      onNextClick={handleSubmit}
      disabledNext={false}
      onBackClick={() => handlePrevStep(step)}
    >
      {isLoading ?
        <Spinner/> :
        <h1>
          Registration in AdClassify
        </h1>
      }
    </WindowCard>
  )
}

export default Classifier
