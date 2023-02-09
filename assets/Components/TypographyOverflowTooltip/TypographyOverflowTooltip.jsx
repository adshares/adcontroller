import React, { useEffect, useRef, useState } from 'react';
import { Tooltip, Typography } from '@mui/material';

export default function TypographyOverflowTooltip({ title = undefined, variant, color, children }) {
  const [hoverStatus, setHover] = useState(false);
  const textElementRef = useRef();

  const compareSize = () => {
    const compare = textElementRef.current.scrollWidth > textElementRef.current.clientWidth;
    setHover(compare);
  };

  useEffect(() => {
    compareSize();
    window.addEventListener('resize', compareSize);

    return () => {
      window.removeEventListener('resize', compareSize);
    };
  }, []);

  return (
    <Tooltip title={title || children} disableHoverListener={!hoverStatus}>
      <Typography
        ref={textElementRef}
        variant={variant}
        color={color}
        sx={{
          display: 'block',
          maxWidth: '100%   ',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {children}
      </Typography>
    </Tooltip>
  );
}
