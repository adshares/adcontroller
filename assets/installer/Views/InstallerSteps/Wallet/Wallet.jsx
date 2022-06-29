import React, { useEffect, useState } from 'react'
import apiService from '../../../utils/apiService'
import { Box, TextField, } from '@mui/material'
import WindowCard from '../../../Components/WindowCard/WindowCard'
import Spinner from '../../../Components/Spiner/Spinner'
import styles from '../styles.scss'

const Wallet = ({handleNextStep, handlePrevStep, step}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [stepData, setStepData] = useState({
    wallet_address: '',
    wallet_secret_key: '',
    data_required: true
  })

  const [formErrors, setFormErrors] = useState({
    wallet_address: '',
    wallet_secret_key: ''
  })
  const [isFormValid, setIsFormValid] = useState(false)

  useEffect(() => {
    getStepData().catch(error => console.log(error))

  }, [])

  useEffect(() => {
    checkFormError()
  }, [stepData])

  const getStepData = async () => {
    setIsLoading(true)
    const response = await apiService.getCurrentStepData(step.path)
    setStepData({...stepData, ...response })
    setIsLoading(false)
    console.log(response)
  }

  const checkFormError = () => {
    const isFormErrors = Object.keys(formErrors).some(el => !!formErrors[el])
    setIsFormValid(!isFormErrors)
  }

  const onFormChange = (e) => {
    const {name, value} = e.target
    console.log(name, value)
    setStepData({...stepData, [name]: value})

    if(!!value){
      setFormErrors({...formErrors, [name]: ''})
    } else {
      setFormErrors({...formErrors, [name]: 'Required field'})
    }
    if(name === 'wallet_address'){
      if(value.match(/^[0-9A-F]{4}-[0-9A-F]{8}-([0-9A-F]{4})$/g)){
        setFormErrors({...formErrors, wallet_address: ''})
      } else {
        setFormErrors({...formErrors, wallet_address: 'invalid address format'})
      }
    }
    if(name === 'wallet_secret_key'){
      if(value.match(/^[0-9A-F]{64}$/g)){
        setFormErrors({...formErrors, wallet_secret_key: ''})
      } else {
        setFormErrors({...formErrors, wallet_secret_key: 'invalid key format'})
      }
    }
  }

  const handleSubmit = async () => {
    if(!isFormValid) {
      return
    }
    setIsLoading(true)
    await apiService.sendStepData(step.path, stepData)
    handleNextStep(step)
    setIsLoading(false)
  }

  const onNextClick = () => {
    // if(!!stepData.walletAddress){
    //   handleNextStep(step)
    // }
  }

  return (
    <WindowCard
      title='Wallet information'
      onNextClick={handleSubmit}
      disabledNext={!isFormValid || isLoading}
      onBackClick={() => handlePrevStep(step)}
    >
      {isLoading ?
        <Spinner/> :
        <Box className={styles.container}>
          <Box
            component='form'
            className={styles.container}
            onChange={onFormChange}
          >
            <TextField
              className={styles.textField}
              error={!!formErrors.addressError}
              helperText={formErrors.addressError}
              value={stepData.wallet_address}
              margin='normal'
              size='small'
              name='wallet_address'
              label='Wallet address'
              type='text'
              required
            />
            <TextField
              error={!!formErrors.keyError}
              helperText={formErrors.keyError}
              value={stepData.wallet_secret_key}
              margin='normal'
              size='small'
              name='wallet_secret_key'
              label='Wallet private key'
              multiline
              rows={2}
              required
            />
          </Box>
        </Box>
      }
      </WindowCard>
  )
}

export default Wallet
