import React from "react";
import { useNavigate } from 'react-router-dom'

import { SimpleForm, TextInput } from 'react-admin'

import { Card, CardContent, CardHeader } from '@mui/material'

const formValidation = (values) => {
  const errors = {}
  if (!values.domain) {
    errors.domain = 'The domain name is required';
  }

  if (!values.supportEmail) {
    errors.supportEmail = 'The support email is required';
  }

  if (!values.contactEmail) {
    errors.contactEmail = 'The contact email is required';
  }

  return errors
}


export const ThirdStep = ({ setState }) => {
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    console.log(e)
    setState(prevState => [...prevState, e])
    navigate(`/first`)
    console.log(location)
  }

  return (
    <Card>
      <CardHeader title="Step 3" />
      <CardContent>Lorem ipsum sic dolor amet...</CardContent>
      <SimpleForm onSubmit={handleSubmit} validate={formValidation}>
        <TextInput
          label='Domain name'
          source='domain'
          type='text'
        />
        <TextInput
          label='Email to support'
          source='supportEmail'
          type='text'
        />
        <TextInput
          label='Email to contact'
          source='contactEmail'
          type='text'
        />
      </SimpleForm>
    </Card>
  )};
