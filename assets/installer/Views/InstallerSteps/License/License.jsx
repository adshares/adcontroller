import React, { useEffect, useState } from 'react'
import apiService from '../../../utils/apiService'
import WindowCard  from '../../../Components/WindowCard/WindowCard'
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
} from '@mui/material'
import styles from './styles.scss'
import Spinner from '../../../Components/Spiner/Spinner'
import { useForm } from '../../../hooks/hooks'

const InfoTable = ({stepData}) => {
  return(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell align='left'>License owner</TableCell>
            <TableCell align='left'>{stepData.owner}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell align='left'>License type</TableCell>
            <TableCell align='left'>{stepData.type}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell align='left'>License will expire</TableCell>
            <TableCell align='left'>{stepData.date_end}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell align='left'>Fixed fee</TableCell>
            <TableCell align='left'>{stepData.fixed_fee} ADS</TableCell>
          </TableRow>
          <TableRow>
            <TableCell align='left'>Supply fee / Demand fee</TableCell>
            <TableCell align='left'>{stepData.supply_fee * 100}% / {stepData.demand_fee * 100}%</TableCell>
          </TableRow>
        </TableBody>
      </Table>
  )
}

const License = ({handleNextStep, handlePrevStep, step}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isLicenseLoading, setIsLicenseLoading] = useState(true)
  const [stepData, setStepData] = useState({
    demand_fee: 0.01,
    fixed_fee: 0,
    supply_fee: 0.01,
    owner: '',
    date_end: '',
    type: '',
    date_start: '',
    payment_address: '',
    payment_message: '',
    private_label: false,
    status: 1,
  })
  const [editMode, setEditMode] = useState(false)
  const {fields, errorObj, isFormValid, onFormChange, validate} = useForm({licenseKey: ''})

  useEffect(() => {
    getStepData().catch(error => console.log(error))
  }, [])

  const getStepData = async () => {
    setIsLoading(true)
    const response = await apiService.getCurrentStepData(step.path)
    setStepData({...stepData, ...response.license_data})
    setEditMode(response.data_required)
    setIsLoading(false)
    setIsLicenseLoading(false)
  }

  const handleGetLicenseClick = async () => {
    setIsLicenseLoading(true)
    const response = await apiService.getLicenseByKey({license_key: fields.licenseKey})
    setIsLicenseLoading(false)
    setStepData({...response.license_data})
  }

  const handleGetFreeLicenseClick = async () => {
    if(stepData.owner) {
      return
    }
    setIsLicenseLoading(true)
    const response = await apiService.getCommunityLicense()
    setIsLicenseLoading(false)
    setStepData({...response.license_data})
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    await apiService.sendStepData(step.path, {})
    handleNextStep(step)
    setIsLoading(false)
  }

  const conditionalRender = (isEditMode) => {

    return isEditMode ? (
      <Box className={styles.container}>
        <Box
          className={styles.form}
          component='form'
          onChange={onFormChange}
          onBlur={(e) => validate(e.target)}
        >
          <Box className={styles.field}>
            <TextField
              error={!!errorObj.licenseKey}
              helperText={errorObj.licenseKey}
              placeholder='XXX-xxxxxx-xxxxx-xxxxx-xxxx-xxxx'
              size='small'
              name='licenseKey'
              label='Your license key'
              value={fields.licenseKey}
              type='text'
              fullWidth
            />
          </Box>
          <Button
            disabled={!isFormValid}
            type='button'
            variant='contained'
            onClick={handleGetLicenseClick}
          >
            Get license
          </Button>
        </Box>

        {editMode && (
          isLicenseLoading ?
            <Spinner /> :
            (stepData.owner) && <InfoTable stepData={stepData}/>
        )}

        <Box className={styles.freeLicense}>
          {!stepData.owner &&
            <Button
              onClick={handleGetFreeLicenseClick}
              type="button"
              variant="text"
            >
              Get free license
            </Button>
          }
        </Box>
      </Box>
    ) : (
      <>
        <Box className={styles.editButtonThumb}>
          {!editMode &&
            <Button
              onClick={() => (setEditMode(true))}
              type="button"
            >
              Edit
            </Button>
          }
        </Box>
        {isLicenseLoading ?
          <Spinner/> :
          <InfoTable stepData={stepData}/>
        }
      </>
      )
  }

  return (
      <WindowCard
        title='License information'
        onNextClick={handleSubmit}
        onBackClick={() => handlePrevStep(step)}
        disabledNext={!stepData.owner || isLoading}
      >
        {isLoading ?
          <Spinner /> :
          conditionalRender(editMode)
        }
      </WindowCard>
  )
}

export default License
