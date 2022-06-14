import React from 'react'
import { Button } from '@mui/material'
import { SaveButton, Toolbar } from 'react-admin'

export const FormToolBar = ({handleBackClick}) => {

  return (
    <Toolbar>
      <Button onClick={handleBackClick} variant='contained'>Back</Button>
      <SaveButton>Next</SaveButton>
    </Toolbar>
  )
}
