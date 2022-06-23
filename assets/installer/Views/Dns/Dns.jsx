import React, { useState, useEffect } from 'react'
import apiService from '../../utils/apiService'
import { WindowCard } from '../../Components/WindowCard/WindowCard'
import { Button, Typography } from '@mui/material'
import styles from '../Base/styles.scss'

const Dns = () => {
  const [stepData, setStepData] = useState({
    base_domain: '',
  })
  useEffect(() => {
    apiService.getCurrentStepData('dns').then(response => setStepData({...stepData, ...response }))
  }, [])
  return (
    <WindowCard title='DNS information'>
      <Typography variant='body1'>
        Base domain address: {stepData.base_domain}
      </Typography>
      <div className={styles.formControl}>
        <Button type='button' variant='outlined'>Back</Button>
        <Button type='submit' variant='contained'>Save</Button>
      </div>
    </WindowCard>
  )
}

export default Dns
