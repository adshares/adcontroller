import React from "react";
import styles from './styles.scss'
import { Box, Card, CardContent, CardHeader } from '@mui/material'


export const WindowCard = ({
  children,
  title
}) => {
  return (
    <Card className={styles.container}>
      <Box>
        <CardHeader title={title} />
        <CardContent>{children}</CardContent>
      </Box>
    </Card>
  )
}
