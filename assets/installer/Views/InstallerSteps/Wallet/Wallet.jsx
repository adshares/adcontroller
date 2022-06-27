import React, { useEffect, useState } from 'react'
import apiService from '../../../utils/apiService'

const Wallet = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [stepData, setStepData] = useState({})

  useEffect(() => {
    setIsLoading(true)
    apiService.getCurrentStepData('wallet').then(response => {
      setStepData({...stepData, ...response })
      setIsLoading(false)
    })
  }, [])

  return <h1>Wallet</h1>
}

export default Wallet
