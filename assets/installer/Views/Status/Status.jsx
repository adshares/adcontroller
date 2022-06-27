import React, { useEffect, useState } from 'react'
import apiService from '../../utils/apiService'

const Status = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [stepData, setStepData] = useState({})

  useEffect(() => {
    setIsLoading(true)
    apiService.getCurrentStepData('status').then(response => {
      setStepData({...stepData, ...response })
      setIsLoading(false)
    })
  }, [])

  console.log(stepData)

  return <h1>Status</h1>
}

export default Status
