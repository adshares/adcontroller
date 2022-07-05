import React, { useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import BreadCrumbs from '../../Components/BreadCrumbs/BreadCrumbs'

const MultiStep = ({ currentStep: lastCompletedStep, steps }) => {
  const [currentInstallerStep, setCurrentInstallerStep] = useState(steps.find(el => el.path === lastCompletedStep))
  const [unlockedSteps, setUnlockedSteps] = useState(steps.filter(el => el.index <= currentInstallerStep.index))
  const navigate = useNavigate()

  const handleNextStep = (step) => {
    const nextEl = steps.find(el => el.index === step.index + 1)
    setCurrentInstallerStep(nextEl)
    if(!unlockedSteps.find(el => nextEl.index === el.index)){
      setUnlockedSteps([...unlockedSteps, nextEl])
    }
    navigate(nextEl.path)
  }

  const handlePrevStep = (step) => {
    const prevEl = steps.find(el => el.index === step.index - 1)
    navigate(prevEl.path)
  }

  const handleCurrentStep = (step) => {
    navigate(step.path)
  }

  return (
    <>
      <BreadCrumbs
        steps={steps}
        unlockedSteps={unlockedSteps.length}
        handleCurrentStep={handleCurrentStep}
      />
      <Routes>
        {unlockedSteps.map(step => (
          <Route
            key={step.path}
            path={step.path}
            element={
              <step.component
                handleNextStep={handleNextStep}
                handlePrevStep={handlePrevStep}
                step={step}
              />
            }
          />
        ))}
        <Route path="*" element={<Navigate to={lastCompletedStep}/>}/>
      </Routes>
    </>

  )
}
export default MultiStep
