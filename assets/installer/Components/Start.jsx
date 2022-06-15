import React, { useState } from 'react'
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
        <Button onClick={handleStart} variant='contained'>Start</Button>
      </CardContent>
    </Card>
  )



  // return(
  //   <Card>
  //     <CardHeader title="Start" />
  //     <CardContent>
  //       <Button onClick={handleStart} variant='contained'>Start</Button>
  //     </CardContent>
  //
  //   </Card>
  // )
}
