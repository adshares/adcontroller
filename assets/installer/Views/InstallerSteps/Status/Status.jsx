import React, { useEffect, useState } from 'react'
import apiService from '../../../utils/apiService'
import {
  Icon,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
} from '@mui/material'
import WindowCard from '../../../Components/WindowCard/WindowCard'
import Spinner from '../../../Components/Spiner/Spinner'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

const Status = ({ handlePrevStep, step }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [stepData, setStepData] = useState({
    adclassify: { module: null, version: null, url: null, code: null },
    adpanel: { module: null, version: null, url: null, code: null },
    adpay: { module: null, version: null, url: null, code: null },
    adselect: { module: null, version: null, url: null, code: null },
    adserver: { module: null, version: null, url: null, code: null },
    aduser: { module: null, version: null, url: null, code: null },
    data_required: false
  })

  useEffect(() => {
    getStepData().catch(error => console.log(error))
  }, [])

  const getStepData = async () => {
    setIsLoading(true)
    const response = await apiService.getCurrentStepData(step.path)
    setIsLoading(false)
    setStepData({
      adclassify: response.adclassify,
      adpanel: response.adpanel,
      adpay: response.adpay,
      adselect: response.adselect,
      adserver: response.adserver,
      aduser: response.aduser,
    })
  }

  return (
    <WindowCard
      title="Status"
      disabledNext
      onBackClick={() => handlePrevStep(step)}
    >
      {isLoading ?
        <Spinner/> :
        (
          <Table>
            <TableBody>
              <TableRow>
                <TableCell align="left">{stepData.adserver.module}</TableCell>
                <TableCell align="left">{stepData.adserver.version}</TableCell>
                <TableCell align="left">{stepData.adserver.url}</TableCell>
                <TableCell>
                  <Tooltip title={stepData.adserver.code}>
                    <Icon>{stepData.adserver.code === 200 ? <CheckIcon color="success"/> : <CloseIcon
                      color="error"/>}</Icon>
                  </Tooltip>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">{stepData.adpanel.module}</TableCell>
                <TableCell align="left">{stepData.adpanel.version}</TableCell>
                <TableCell align="left">{stepData.adpanel.url}</TableCell>
                <TableCell>
                  <Tooltip title={stepData.adpanel.code}>
                    <Icon>{stepData.adpanel.code === 200 ? <CheckIcon color="success"/> : <CloseIcon
                      color="error"/>}</Icon>
                  </Tooltip>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">{stepData.aduser.module}</TableCell>
                <TableCell align="left">{stepData.aduser.version}</TableCell>
                <TableCell align="left">{stepData.aduser.url}</TableCell>
                <TableCell>
                  <Tooltip title={stepData.aduser.code}>
                    <Icon>{stepData.aduser.code === 200 ? <CheckIcon color="success"/> : <CloseIcon
                      color="error"/>}</Icon>
                  </Tooltip>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">{stepData.adselect.module}</TableCell>
                <TableCell align="left">{stepData.adselect.version}</TableCell>
                <TableCell align="left">{stepData.adselect.url}</TableCell>
                <TableCell>
                  <Tooltip title={stepData.adselect.code}>
                    <Icon>{stepData.adselect.code === 200 ? <CheckIcon color="success"/> : <CloseIcon
                      color="error"/>}</Icon>
                  </Tooltip>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">{stepData.adclassify.module}</TableCell>
                <TableCell align="left">{stepData.adclassify.version}</TableCell>
                <TableCell align="left">{stepData.adclassify.url}</TableCell>
                <TableCell>
                  <Tooltip title={stepData.adclassify.code}>
                    <Icon>{stepData.adclassify.code === 200 ? <CheckIcon color="success"/> : <CloseIcon
                      color="error"/>}</Icon>
                  </Tooltip>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left">{stepData.adpay.module}</TableCell>
                <TableCell align="left">{stepData.adpay.version}</TableCell>
                <TableCell align="left">{stepData.adpay.url}</TableCell>
                <TableCell>
                  <Tooltip title={stepData.adpay.code}>
                    <Icon>{stepData.adpay.code === 200 ? <CheckIcon color="success"/> : <CloseIcon
                      color="error"/>}</Icon>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )
      }
    </WindowCard>
  )
}

export default Status