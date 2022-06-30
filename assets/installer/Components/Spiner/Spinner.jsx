import React from 'react'
import { Box, CircularProgress } from '@mui/material'
import styles from './styles.scss'

const Spinner = () => {
  return (
    <Box className={styles.container}>
      <CircularProgress />
    </Box>
  )
}

export default Spinner
