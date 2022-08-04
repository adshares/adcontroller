import React from 'react';
import { Box, Step, Stepper, StepButton, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';

const NavStepper = ({ steps, unlockedSteps, handleCurrentStep }) => {
  const completedSteps = unlockedSteps.filter((step) => step.index < unlockedSteps.length).map((step) => step.path);
  const location = useLocation();
  console.log(location.pathname.slice(7));
  console.log(unlockedSteps);

  const items = steps.map((step) => {
    const activeStep = step.path === location.pathname.slice(7);
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
          <Typography variant="body2" sx={activeStep && { fontWeight: 600, color: 'primary.main' }}>
            {step.path === 'smtp' ? step.path.toUpperCase() : step.path}
          </Typography>
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
