import React, { useEffect, useState } from 'react'
import { Button, TextField } from '@mui/material'
import { WindowCard } from '../../Components/WindowCard/WindowCard'

import styles from './styles.scss'
import apiService from '../../utils/apiService'

const Base = () => {
  const [stepData, setStepData] = useState({
    base_adserver_name: '',
    base_domain: '',
    base_support_email: '',
    base_contact_email: '',
  })

  useEffect(() => {
    apiService.getCurrentStepData('base').then(response => setStepData({...stepData, ...response }))
  }, [])

  const onFormChange = (e) => {
    const {name, value} = e.target
    setStepData({...stepData, [name]: value})
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    apiService.sendStepData('base', stepData).then(r => console.log(r))
    console.log(stepData)
  }
  return (
    <WindowCard title='Base information'>
      <form
        className={styles.form}
        onChange={onFormChange}
        onSubmit={handleSubmit}
      >
        <TextField
          margin='normal'
          size='small'
          name='base_adserver_name'
          label='Adserver name'
          value={stepData.base_adserver_name}
          type='text'
          required
        />
        <TextField
          margin='normal'
          size='small'
          name='base_domain'
          label='Domain name'
          value={stepData.base_domain}
          type='text'
          required
        />
        <TextField
          margin='normal'
          size='small'
          name='base_support_email'
          label='Email to support'
          value={stepData.base_support_email}
          type='email'
          placeholder='support@domain'
          required
        />
        <TextField
          margin='normal'
          size='small'
          name='base_contact_email'
          label='Email to contact'
          value={stepData.base_contact_email}
          type='email'
          placeholder='tech@domain'
          required
        />
        <div className={styles.formControl}>
          <Button type='submit' variant='contained'>Save</Button>
        </div>
      </form>
    </WindowCard>
  )
}

export default Base
