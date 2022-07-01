import React, { useEffect, useRef, useState } from 'react'
import apiService from '../../../utils/apiService'
import { Box, Button, Collapse, TextField, Typography, } from '@mui/material'
import WindowCard from '../../../Components/WindowCard/WindowCard'
import Spinner from '../../../Components/Spiner/Spinner'
import styles from './styles.scss'
import { useForm, useSkipFirstRenderEffect } from '../../../hooks/hooks'

const Wallet = ({handleNextStep, handlePrevStep, step}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isHostVerification, setIsHostVerification] = useState(false)
  const {fields, errorObj, setFields, isFormValid, onFormChange, validate} = useForm({
    wallet_address: '',
    wallet_secret_key: '',
  })
  const {
    fields: nodeHost,
    setFields: setNodeHost,
    errorObj: nodeHostError,
    isFormValid: isNodeHostValid,
    onFormChange: onNodeHostChange
  } = useForm({
    wallet_node_host: '',
    wallet_node_port: '',
    message: '',
    code: null,
  })
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    getStepData().catch(error => console.log(error))

  }, [])
  useSkipFirstRenderEffect(() => {
    if(!errorObj.wallet_address){
      getWalletNodes().catch(error => console.log(error))
    }
  }, [errorObj.wallet_address])

  const getStepData = async () => {
    setIsLoading(true)
    const response = await apiService.getCurrentStepData(step.path)
    setEditMode(response.data_required)
    console.log(response)
    setFields({...fields, ...response})
    setIsLoading(false)
  }

  const getWalletNodes = async () => {
    setIsHostVerification(true)
    const response = await apiService.getWalletNodeHost({wallet_address: fields.wallet_address })
    setIsHostVerification(false)
    if(response.code){
      setNodeHost({
        ...response,
        ...{wallet_node_host: '', wallet_node_port: ''}
      })
      return
    }
    setNodeHost({
      ...response,
      ...{message: '', code: null}
    })
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
    setIsLoading(true)
    const body = {
      wallet_address: fields.wallet_address,
      wallet_secret_key: fields.wallet_secret_key,
      wallet_node_host: nodeHost.wallet_node_host,
      wallet_node_port: Number(nodeHost.wallet_node_port),
    }
    await apiService.sendStepData(step.path, body)
    handleNextStep(step)
    setIsLoading(false)
  }

  const conditionalComponent = (isEditMode) => {
    return isEditMode ? (
      <Box className={styles.container}>
        <Box
          component='form'
          className={styles.formBlock}
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
            type='password'
            required
          />
          <Button
            onClick={() => setEditMode(!editMode)}
            className={(isEditMode && !fields.data_required) ? styles.visible : styles.hidden}
          >
            Cancel
          </Button>
        </Box>
        <Collapse
          className={styles.formBlock}
          component='form'
          in={Object.values(nodeHost).some(el => !!el)}
          timeout='auto'
          unmountOnExit
          onChange={onNodeHostChange}
        >
          <TextField
            error={!!nodeHostError.wallet_node_host}
            helperText={nodeHostError.wallet_node_host}
            value={nodeHost.wallet_node_host}
            disabled={!!nodeHost.code}
            margin='normal'
            size='small'
            name='wallet_node_host'
            label='Wallet node host'
            fullWidth
          />
          <TextField
            error={!!nodeHostError.wallet_node_port}
            helperText={nodeHostError.wallet_node_port}
            value={nodeHost.wallet_node_port}
            disabled={!!nodeHost.code}
            margin='normal'
            size='small'
            name='wallet_node_port'
            label='Wallet node port'
            fullWidth
          />
          <Typography variant='body2' color='error'>
            {nodeHost.message}
          </Typography>
        </Collapse>
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
// console.log(isNodeHostValid)
  return (
    <WindowCard
      title='Wallet information'
      onNextClick={handleSubmit}
      disabledNext={editMode ?
        !isFormValid || !isNodeHostValid || isLoading || isHostVerification || nodeHost.code === 422:
        isLoading
      }
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
