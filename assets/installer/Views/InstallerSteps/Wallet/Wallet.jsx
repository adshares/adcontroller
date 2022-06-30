import React, { useEffect, useState } from 'react'
import apiService from '../../../utils/apiService'
import { Box, Button, TextField, Typography, } from '@mui/material'
import WindowCard from '../../../Components/WindowCard/WindowCard'
import Spinner from '../../../Components/Spiner/Spinner'
import styles from './styles.scss'
import { useForm } from '../../../hooks/hooks'

const Wallet = ({handleNextStep, handlePrevStep, step}) => {
  const [isLoading, setIsLoading] = useState(true)
  const {fields, errorObj, setFields, isFormValid, onFormChange, validate} = useForm({
    wallet_address: '',
    wallet_secret_key: '',
  })
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    getStepData().catch(error => console.log(error))

  }, [])

  const getStepData = async () => {
    setIsLoading(true)
    const response = await apiService.getCurrentStepData(step.path)
    setIsLoading(false)
    setFields({...fields, ...response})
    setEditMode(response.data_required)

  }

  const handleSubmit = async () => {
    if(!editMode){
      await apiService.sendStepData(step.path, {})
      handleNextStep(step)
      setIsLoading(false)
      return
    }
    if(!isFormValid) {
      return
    }
    console.log(isFormValid)
    setIsLoading(true)
    await apiService.sendStepData(step.path, fields)
    handleNextStep(step)
    setIsLoading(false)
  }

  const conditionalComponent = (isEditMode) => {
    return isEditMode ? (
      <Box className={styles.container}>
        <Box
          component='form'
          className={styles.container}
          onChange={onFormChange}
          onBlur={(e) => validate(e.target)}
        >
          <TextField
            className={styles.textField}
            error={!!errorObj.wallet_address}
            helperText={errorObj.wallet_address}
            value={fields.wallet_address}
            margin='normal'
            size='small'
            name='wallet_address'
            label='Wallet address'
            type='text'
            required
          />
          <TextField
            error={!!errorObj.wallet_secret_key}
            helperText={errorObj.wallet_secret_key}
            value={fields.wallet_secret_key}
            margin='normal'
            size='small'
            name='wallet_secret_key'
            label='Wallet private key'
            required
          />
          <Button
            onClick={() => setEditMode(!editMode)}
            className={(isEditMode && !fields.data_required) ? styles.visible : styles.hidden}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    ) : (
      <Box className={styles.container}>
        <Box className={styles.content}>
          <Typography>
            Your wallet address: {fields.wallet_address}
          </Typography>
          <Button
            onClick={() => setEditMode(!editMode)}
            className={(isEditMode ? styles.hidden : styles.visible)}
          >
            Edit
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <WindowCard
      title='Wallet information'
      onNextClick={handleSubmit}
      disabledNext={editMode ? !isFormValid || isLoading : isLoading}
      onBackClick={() => handlePrevStep(step)}
    >
      {isLoading ?
        <Spinner/> :
        conditionalComponent(editMode)
      }
      </WindowCard>
  )
}

export default Wallet
