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
          <TableCell align='center'>{stepData.owner}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align='left'>License type</TableCell>
          <TableCell align='center'>{stepData.type}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align='left'>License will expire</TableCell>
          <TableCell align='center'>{stepData.date_end}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align='left'>Fixed fee</TableCell>
          <TableCell align='center'>{stepData.fixed_fee} ADS</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align='left'>Supply fee / Demand fee</TableCell>
          <TableCell align='center'>{stepData.supply_fee * 100}% / {stepData.demand_fee * 100}%</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

const License = ({handleNextStep, handlePrevStep, step}) => {
  const [isLoading, setIsLoading] = useState(true)
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
  const [isFirstTimeConfiguration, setIsFirstTimeConfiguration] = useState(false)
  const {fields, errorObj, setFields, isFormValid, onFormChange, validate} = useForm({licenseKey: ''})

  useEffect(() => {
    getStepData().catch(error => console.log(error))
  }, [])

  const getStepData = async () => {
    setIsLoading(true)
    const response = await apiService.getCurrentStepData(step.path)

    setIsLoading(false)
    // setIsFirstTimeConfiguration(response.data_required)
    setEditMode(response.data_required)
  }

  const handleGetLicenseClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setStepData({...stepData, owner: 'ADSERVER'})
  }

  const handleSubmit = () => {
    console.log('step submitted')
  }

  const conditionalRender = (isEditMode) => {

    return isEditMode ? (
      <Box className={styles.container}>
        <Box
          className={styles.form}
          component='form'
          id='getLicenseByKey'
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

        {(editMode && stepData.owner) && <InfoTable stepData={stepData} />}

        <Box className={styles.freeLicense}>
          {!stepData.owner &&
            <Button
              type="button"
              variant="text"
            >
              Get free license
            </Button>}
        </Box>
      </Box>
    ) : (
      <>
        <Box className={styles.editButtonThumb}>
          {!editMode && <Button onClick={() => (setEditMode(true))} type="button">Edit</Button>}
        </Box>
        <InfoTable stepData={stepData} />
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


// const createLicense = async () => {
//   const response = await apiService.sendStepData(step.path, {license_contact_email: stepData.license_contact_email})
//   if (response.message){
//     setIsLoading(true)
//     await getStepData()
//     setIsLoading(false)
//   }
// }
// const getLicenseByKey = async () => {
//   const response = await apiService.sendStepData(step.path, {license_key: licenseKey})
//   console.log(response)
// }
// const handleSubmit = async (e) => {
//   e.preventDefault()
//   console.log(e.target.id)
//   switch (e.target.id){
//     case 'createLicense':
//       createLicense().catch(error => console.log(error))
//       break
//     case 'getLicenseByKey':
//       getLicenseByKey().catch(error => console.log(error))
//       break
//     default:
//       break
//   }
// }
// const onFormChange = (e) => {
//   const {name, value} = e.target
//
//   switch (name){
//     case 'contactEmail':
//       setStepData({...stepData, [name]: value})
//       break
//
//     case 'licenseKey':
//       setLicenseKey(value)
//       break
//     default:
//       break
//   }
//   console.log(name, value)
// }

