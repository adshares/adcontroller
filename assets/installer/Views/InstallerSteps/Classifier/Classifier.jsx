import React, { useEffect, useState } from 'react'
import apiService from '../../../utils/apiService'

const Classifier = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [stepData, setStepData] = useState({})

  useEffect(() => {
    setIsLoading(true)
    apiService.getCurrentStepData('classifier').then(response => {
      setStepData({...stepData, ...response })
      setIsLoading(false)
    })
  }, [])

  console.log(stepData)

  return <h1>Wallet</h1>
}

export default Classifier
