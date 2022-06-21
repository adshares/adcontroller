import React from "react";
import { useNavigate } from 'react-router-dom'

import { SimpleForm, TextInput } from 'react-admin'

import { Card, CardContent, CardHeader } from '@mui/material'
import { FormToolBar } from './FormToolBar'

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


export const BaseComponent = ({ nextStep, prevStep, el }) => {
  const navigate = useNavigate()

  const handleSubmit = (data) => {
    nextStep(el.index, navigate)
    console.log(data)

  }

  const handleBackClick = () => {
    prevStep(el.index, navigate)

  }

  return (
    <Card>
      <CardHeader title="Base information" />
      <CardContent>Lorem ipsum sic dolor amet...</CardContent>
      <SimpleForm
        onSubmit={handleSubmit}
        validate={formValidation}
        toolbar={<FormToolBar handleBackClick={handleBackClick} />}
      >
        <TextInput
          name='domain'
          label='Domain name'
          source='domain'
          type='text'
        />
        <TextInput
          name='supportEmail'
          label='Email to support'
          source='supportEmail'
          type='email'
        />
        <TextInput
          name='contactEmail'
          label='Email to contact'
          source='contactEmail'
          type='email'
        />
      </SimpleForm>
    </Card>
)};
