import React from 'react'
import { Button, Card, CardContent, CardHeader } from '@mui/material'
import { useNavigate } from 'react-router-dom'


export const StartComponent = ({nextStep}) => {
  const navigate = useNavigate()

  const handleStart = () => {
    nextStep(0, navigate)
  }

  return(
    <Card>
      <CardHeader title="Start" />
      <CardContent>
        <p>Welcome to the installer module. Follow next steps to complete the installation. Click Start to continue.</p>
        <Button sx={{marginTop: '16px'}} onClick={handleStart} variant='contained'>Start</Button>
      </CardContent>
    </Card>
  )
}
