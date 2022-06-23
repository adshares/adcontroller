import React from 'react'
import { Box, Button, Typography } from '@mui/material'

import styles from './styles.scss'
import { useNavigate } from 'react-router-dom'

export default function NotFoundView() {
  const navigate = useNavigate()
  const onButtonClick = () => {
    navigate('/login')
    console.log('click')
  }
  return (
    <Box className={styles.wrapper}>
      <Box className={styles.container}>
        <Typography variant='h4' component='div'>
          Page not found.
        </Typography>
        <Button variant='contained' type='button' onClick={onButtonClick}>Go back</Button>
      </Box>
    </Box>
  )
}
