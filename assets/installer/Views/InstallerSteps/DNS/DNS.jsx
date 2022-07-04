import React, { useState, useEffect } from 'react'
import apiService from '../../../utils/apiService'
import WindowCard from '../../../Components/WindowCard/WindowCard'
import Spinner from '../../../Components/Spiner/Spinner'
import { Box, Icon, Popover, Table, TableBody, TableCell, TableRow, Tooltip, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import styles from './styles.scss'


const DNS = ({handleNextStep, handlePrevStep, step}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [stepData, setStepData] = useState({
    adpanel: {module: null, url: null, code: null},
    adserver: {module: null, url: null, code: null},
    aduser: {module: null, url: null, code: null},
    // data_required: false,
  })

  useEffect(() => {
    getStepData().catch(error => console.log(error))
  }, [])

  const getStepData = async () => {
    setIsLoading(true)
    const response = await apiService.getCurrentStepData(step.path)
    setIsLoading(false)
    setStepData({
      adpanel: response.adpanel,
      adserver: response.adserver,
      aduser: response.aduser
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await apiService.sendStepData(step.path, {})
    handleNextStep(step)
  }

  return (
    <WindowCard
      title='DNS information'
      onNextClick={handleSubmit}
      onBackClick={() => handlePrevStep(step)}
      disabledNext={isLoading}
    >
      {isLoading ?
        <Spinner/> :
        <Box className={styles.container}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>{stepData.adpanel.module}</TableCell>
                <TableCell>{stepData.adpanel.url}</TableCell>
                <TableCell>
                  <Tooltip title={stepData.adpanel.code}>
                    <Icon>{stepData.adpanel.code === 200 ? <CheckIcon color='success'/> : <CloseIcon color='error' />}</Icon>
                  </Tooltip>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{stepData.adserver.module}</TableCell>
                <TableCell>{stepData.adserver.url}</TableCell>
                <TableCell>
                  <Tooltip title={stepData.adserver.code}>
                    <Icon>{stepData.adpanel.code === 200 ? <CheckIcon color='success'/> : <CloseIcon color='error' />}</Icon>
                  </Tooltip>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{stepData.aduser.module}</TableCell>
                <TableCell>{stepData.aduser.url}</TableCell>
                <TableCell>
                  <Tooltip title={stepData.adpanel.code}>
                    <Icon>{stepData.aduser.code === 200 ? <CheckIcon color='success'/> : <CloseIcon color='error' />}</Icon>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      }
    </WindowCard>
  )
}

export default DNS
