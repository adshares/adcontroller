import React from 'react'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import { Button } from '@mui/material'

const BreadCrumbs = ({ steps, unlockedSteps, handleCurrentStep }) => {
  const breadcrumbs = steps.map(step => (
    <Button
      key={step.index}
      disabled={step.index > unlockedSteps}
      onClick={() => handleCurrentStep(step)}
    >
      {step.path}
    </Button>
  ))

  return (
    <Breadcrumbs separator=">">
      {breadcrumbs}
    </Breadcrumbs>
  )
}

export default BreadCrumbs

