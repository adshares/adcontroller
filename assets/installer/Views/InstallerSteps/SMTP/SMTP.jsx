import React, { useEffect, useState } from 'react'
import apiService from '../../../utils/apiService'
import {
  Box,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography
} from '@mui/material'
import styles from '../Base/styles.scss'
import { WindowCard } from '../../../Components/WindowCard/WindowCard'

const SMTP = ({ handleNextStep, handlePrevStep, step }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [stepData, setStepData] = useState({
    requiredData: true,
    smtpHost: null,
    smtpPassword: null,
    smtpPort: null,
    smtpSender: null,
    smtpUsername: null,
  })

  useEffect(() => {
    getStepData().catch(error => console.log(error))
    // setIsLoading(true)
    // apiService.getCurrentStepData('smtp').then(response => {
    //   setStepData({...stepData, ...response })
    //   setIsLoading(false)
    // })
  }, [])

  const getStepData = async () => {
    setIsLoading(true)
    const {
      data_required: requiredData,
      smtp_host: smtpHost,
      smtp_password: smtpPassword,
      smtp_port: smtpPort,
      smtp_sender: smtpSender,
      smtp_username: smtpUsername
    } = await apiService.getCurrentStepData(step.path)
    setIsLoading(false)
    setStepData({
      requiredData,
      smtpHost,
      smtpPassword,
      smtpPort,
      smtpSender,
      smtpUsername
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await apiService.sendStepData(step.path, stepData)
    handleNextStep(step)
  }

  // const createTable = () => {
  //   const data =
  // }

  return (
    isLoading ?
      <Box className={styles.spinner}>
        <CircularProgress/>
      </Box> :
      <WindowCard title="SMTP information">
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>SMTP Host</TableCell>
                <TableCell>{stepData.smtpHost}</TableCell>
              </TableRow>
              <TableRow>
                {/*<TableCell>cvbcvbcvb</TableCell>*/}
                {/*<TableCell>rthrhrthrth</TableCell>*/}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        {/*<Typography variant='body1'>*/}
        {/*  Sender: {stepData.smtp_sender}*/}
        {/*</Typography>*/}
        {/*<Typography variant='body1'>*/}
        {/*  Host: {stepData.smtp_host}*/}
        {/*</Typography>*/}
        {/*<Typography variant='body1'>*/}
        {/*  Port: {stepData.smtp_port || 587}*/}
        {/*</Typography>*/}
        {/*<Typography variant='body1'>*/}
        {/*  Username: {stepData.smtp_username}*/}
        {/*</Typography>*/}
        {/*<Typography variant='body1'>*/}
        {/*  Password: {stepData.smtp_password}*/}
        {/*</Typography>*/}
        <div className={styles.formControl}>
          {step.index > 1 &&
            <Button onClick={() => handlePrevStep(step)} type="button" variant="outlined">Back</Button>}
          <Button onClick={handleSubmit} type="submit" variant="contained">Save</Button>
        </div>
      </WindowCard>
  )
}

export default SMTP
