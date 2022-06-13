import React from 'react'
import { Button, Card, CardContent, CardHeader } from '@mui/material'

export const StartComponent = ({setCompletedSteps}) => {
  const steps = {
    first: {
      name: 'first',
      label: 'First step',
    },
    second: 'SecondStep',
    third: 'ThirdStep'
  }
  const completedSteps = JSON.parse(localStorage.getItem('completedSteps'))
  const handleStart = () => {
    console.log('start')

  }

  if(completedSteps.length){
    // setCompletedSteps(prevState => [...prevState])
    return(
      <Card>
        <CardHeader title="Start" />
        <CardContent>
          <Button onClick={handleStart} variant='contained'>Continue configuration</Button>
        </CardContent>

      </Card>
    )
  }

  if(!completedSteps.length){
    return(
      <Card>
        <CardHeader title="Start" />
        <CardContent>
          <Button onClick={handleStart} variant='contained'>Start</Button>
        </CardContent>

      </Card>
    )
  }



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
