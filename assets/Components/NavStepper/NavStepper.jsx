import React from 'react';
import { Box, Step, Stepper, StepButton } from '@mui/material';

const NavStepper = ({ steps, unlockedSteps, handleCurrentStep }) => {
  const completedSteps = unlockedSteps.filter((step) => step.index < unlockedSteps.length).map((step) => step.path);

  const items = steps.map((step) => {
    return (
      <Step
        key={step.index}
        disabled={step.index > unlockedSteps.length}
        active={step.index <= unlockedSteps.length}
        completed={completedSteps.includes(step.path)}
      >
        <StepButton
          sx={{ textTransform: 'capitalize', padding: '16px', margin: '-16px', borderRadius: '8px' }}
          onClick={() => handleCurrentStep(step)}
        >
          {step.path}
        </StepButton>
      </Step>
    );
  });

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Stepper>{items}</Stepper>
    </Box>
  );
};

export default NavStepper;
