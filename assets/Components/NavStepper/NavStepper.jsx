import React from 'react';
import { useLocation } from 'react-router-dom';
import { Stepper, StepButton, Typography } from '@mui/material';
import MuiStep from '@mui/material/Step';
import { styled } from '@mui/material/styles';

const Step = styled(MuiStep)(({ theme, disabled, active, current }) => {
  return {
    '& .MuiStepLabel-root': {
      '& .MuiStepLabel-label': {
        fontVariationSettings: disabled ? '"wght" 400' : '"wght" 900',
        color: disabled ? '#7b7b7b' : current ? theme.palette.primary.main : 'inherit',
      },
      '& circle': {
        r: 11,
        fill: disabled ? '#7b7b7b' : current ? theme.palette.primary.main : 'transparent',
        stroke: active && !current ? theme.palette.black.main : 'transparent',
      },
      '& text': {
        fill: active && !current ? theme.palette.black.main : theme.palette.light.main,
        stroke: 'none',
        fontVariationSettings: !current && !disabled ? '"wght" 900' : '"wght" 400',
      },
    },
  };
});

const NavStepper = ({ steps, unlockedSteps, handleCurrentStep }) => {
  const location = useLocation();

  const items = steps.map((step) => {
    const activeStep = step.path === location.pathname.slice(7);
    return (
      <Step
        key={step.index}
        disabled={step.index > unlockedSteps.length}
        active={step.index <= unlockedSteps.length}
        current={activeStep ? 1 : 0}
      >
        <StepButton
          sx={{ textTransform: 'uppercase', padding: '16px', margin: '-16px', borderRadius: '8px' }}
          onClick={() => handleCurrentStep(step)}
        >
          <Typography variant="body2">{step.path}</Typography>
        </StepButton>
      </Step>
    );
  });

  return <Stepper sx={{ width: '100%', mb: 2 }}>{items}</Stepper>;
};

export default NavStepper;
