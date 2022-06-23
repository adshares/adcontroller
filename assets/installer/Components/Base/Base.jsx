import React from "react";
import styles from './styles.scss'
import { Box, Card, CardContent, CardHeader, TextField } from '@mui/material'
// import { SimpleForm, TextInput } from 'react-admin'
// import { FormToolBar } from '../../../installer-old/Components/FoormToolbarComponent/FormToolBar'


export const Base = () => {
  return (
    <Box className={styles.wrapper}>
      <Card className={styles.container}>
        <Box>
          <CardHeader title="Base information" />
          <CardContent>Lorem ipsum sic dolor amet...</CardContent>
          <form
            // onSubmit={handleSubmit}
            // validate={formValidation}
            // toolbar={<FormToolBar handleBackClick={handleBackClick} />}
          >
            <TextField
              name='base_adserver_name'
              label='Adserver name'
              source='base_adserver_name'
              type='text'
              fullWidth
            />
            <TextField
              name='base_domain'
              label='Domain name'
              source='base_domain'
              type='text'
              fullWidth
            />
            <TextField
              name='base_support_email'
              label='Email to support'
              source='base_support_email'
              type='email'
              placeholder='support@domain'
              fullWidth
            />
            <TextField
              name='base_contact_email'
              label='Email to contact'
              source='base_contact_email'
              type='email'
              placeholder='tech@domain'
              fullWidth
            />
          </form>
        </Box>
      </Card>
    </Box>
  )
}
