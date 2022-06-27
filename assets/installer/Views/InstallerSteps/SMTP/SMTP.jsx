import React, { useEffect, useState } from 'react'
import apiService from '../../../utils/apiService'

const SMTP = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [stepData, setStepData] = useState({})

  useEffect(() => {
    setIsLoading(true)
    apiService.getCurrentStepData('smtp').then(response => {
      setStepData({...stepData, ...response })
      setIsLoading(false)
    })
  }, [])

  console.log(stepData)

  return <h1>Wallet</h1>
}

export default SMTP
