import React from "react";
import { useNavigate } from 'react-router-dom'

import { SimpleForm, TextInput, SaveButton } from 'react-admin'

import { Card, CardContent, CardHeader, Toolbar } from '@mui/material'
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


export const FirstStep = ({ nextStep, prevStep, el }) => {
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    nextStep(el.index, navigate)

  }

  const handleBackClick = () => {
    prevStep(el.index, navigate)

  }

  return (
    <Card>
      <CardHeader title="Step 1" />
      <CardContent>Lorem ipsum sic dolor amet...</CardContent>
      <SimpleForm
        onSubmit={handleSubmit}
        validate={formValidation}
        toolbar={<FormToolBar
          handleBackClick={handleBackClick}
        />
      }>
        <TextInput
          label='Domain name'
          source='domain'
          type='text'
        />
        <TextInput
          label='Email to support'
          source='supportEmail'
          type='email'
        />
        <TextInput
          label='Email to contact'
          source='contactEmail'
          type='email'
        />
      </SimpleForm>
    </Card>
)};
