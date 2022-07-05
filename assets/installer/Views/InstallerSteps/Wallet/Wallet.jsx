import React, { useEffect, useState } from 'react'
import apiService from '../../../utils/apiService'
import { Box, Button, Collapse, TextField, Typography, } from '@mui/material'
import WindowCard from '../../../Components/WindowCard/WindowCard'
import styles from './styles.scss'
import { useForm, useSkipFirstRenderEffect } from '../../../hooks/hooks'

const Wallet = ({ handleNextStep, handlePrevStep, step }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isHostVerification, setIsHostVerification] = useState(false)
  const { fields, errorObj, setFields, isFormValid, onFormChange, validate } = useForm({
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
  const [dataRequired, setDataRequired] = useState(false)

  useEffect(() => {
    getStepData().catch(error => console.log(error))

  }, [])

  useSkipFirstRenderEffect(() => {
    if (!errorObj.wallet_address) {
      getWalletNodes().catch(error => console.log(error))
    }
  }, [errorObj.wallet_address])

  const getStepData = async () => {
    setIsLoading(true)
    const response = await apiService.getCurrentStepData(step.path)
    setFields({ ...fields, ...response })
    setEditMode(response.data_required)
    setDataRequired(response.data_required)
    setIsLoading(false)
  }

  const getWalletNodes = async () => {
    setIsHostVerification(true)
    const response = await apiService.getWalletNodeHost({ wallet_address: fields.wallet_address })
    setIsHostVerification(false)
    if (response.code) {
      setNodeHost({
        ...response,
        ...{ wallet_node_host: '', wallet_node_port: '' }
      })
      return
    }
    setNodeHost({
      ...response,
      ...{ message: '', code: null }
    })
  }
  const handleSubmit = async () => {
    if (!editMode) {
      handleNextStep(step)
      setIsLoading(false)
      return
    }
    if (!isFormValid) {
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

  return (
    <WindowCard
      dataLoading={isLoading}
      title="Wallet information"
      onNextClick={handleSubmit}
      disabledNext={editMode ?
        !isFormValid || !isNodeHostValid || isHostVerification || nodeHost.code === 422 :
        isLoading
      }
      onBackClick={() => handlePrevStep(step)}
    >
      <Box className={styles.editButtonThumb}>
        <Button
          className={(dataRequired ? styles.hidden : styles.visible)}
          onClick={() => (setEditMode(!editMode))}
          type="button"
        >
          {editMode ? 'Cancel' : 'Edit'}
        </Button>
      </Box>
      {editMode && (
        <Box className={styles.container}>
          <Box
            component="form"
            className={styles.formBlock}
            onChange={onFormChange}
            onBlur={(e) => validate(e.target)}
          >
            <TextField
              className={styles.textField}
              error={!!errorObj.wallet_address}
              helperText={errorObj.wallet_address}
              value={fields.wallet_address}
              margin="normal"
              size="small"
              name="wallet_address"
              label="Wallet address"
              type="text"
              required
            />
            <TextField
              error={!!errorObj.wallet_secret_key}
              helperText={errorObj.wallet_secret_key}
              value={fields.wallet_secret_key}
              margin="normal"
              size="small"
              name="wallet_secret_key"
              label="Wallet private key"
              type="password"
              required
            />
            {/*<Button*/}
            {/*  onClick={() => setEditMode(!editMode)}*/}
            {/*  className={(editMode && !fields.data_required) ? styles.visible : styles.hidden}*/}
            {/*>*/}
            {/*  Cancel*/}
            {/*</Button>*/}
          </Box>
          <Collapse
            className={styles.formBlock}
            component="form"
            in={Object.values(nodeHost).some(el => !!el)}
            timeout="auto"
            unmountOnExit
            onChange={onNodeHostChange}
          >
            <TextField
              error={!!nodeHostError.wallet_node_host}
              helperText={nodeHostError.wallet_node_host}
              value={nodeHost.wallet_node_host}
              disabled={!!nodeHost.code}
              margin="normal"
              size="small"
              name="wallet_node_host"
              label="Wallet node host"
              fullWidth
            />
            <TextField
              error={!!nodeHostError.wallet_node_port}
              helperText={nodeHostError.wallet_node_port}
              value={nodeHost.wallet_node_port}
              disabled={!!nodeHost.code}
              margin="normal"
              size="small"
              name="wallet_node_port"
              label="Wallet node port"
              fullWidth
            />
            <Typography variant="body2" color="error">
              {nodeHost.message}
            </Typography>
          </Collapse>
        </Box>
      )}

      {!editMode && (
        <Box className={styles.container}>
          <Box className={styles.content}>
            <Typography variant="body1">
              Your wallet address: {fields.wallet_address}
            </Typography>
            {/*<Button*/}
            {/*  onClick={() => setEditMode(!editMode)}*/}
            {/*  className={(editMode ? styles.hidden : styles.visible)}*/}
            {/*>*/}
            {/*  Edit*/}
            {/*</Button>*/}
          </Box>
        </Box>
      )}


    </WindowCard>
  )
}

export default Wallet

