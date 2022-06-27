import React, { useEffect, useState } from 'react'
import apiService from '../../../utils/apiService'

const License = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [stepData, setStepData] = useState({})

  useEffect(() => {
    setIsLoading(true)
    apiService.getCurrentStepData('license').then(response => {
      setStepData({...stepData, ...response })
      setIsLoading(false)
    })
  }, [])

  console.log(stepData)

  return <h1>License</h1>
}

export default License
