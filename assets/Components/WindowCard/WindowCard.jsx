import React, { useState } from 'react'
import styles from './styles.scss'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Collapse,
  IconButton,
  Typography
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';

import Spinner from '../Spinner/Spinner'
import { useSkipFirstRenderEffect } from '../../hooks'

const WindowCard = ({
  alert = {type: '', message: '', title: ''},
  dataLoading = false,
  children,
  title,
  onNextClick,
  onBackClick,
  disabledNext = false,
  hideBackButton = false,
  hideNextButton = false,
  isLastCard = false
}) => {
  const [openAlert, setOpenAlert] = useState(false)

  useSkipFirstRenderEffect(() => {
    setOpenAlert(true)
    setTimeout(() => setOpenAlert(false), 7000)
  }, [alert])

  return (
    <Card className={styles.container}>
      <CardHeader title={title}/>

      <CardContent className={styles.content}>
        {dataLoading ? <Spinner/> : children}
      </CardContent>

      <Box className={styles.cardFooter}>
        <Collapse in={openAlert} className={styles.alert}>
          {!!alert.message && (
            <Alert
              severity={alert.type}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setOpenAlert(false);
                  }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              <Typography variant='body2' className={styles.alertContent}>
                {alert.title}: {alert.message}
              </Typography>
            </Alert>
          )}
        </Collapse>

        <CardActions className={styles.controls}>
          {!hideBackButton &&
            <Button
              onClick={onBackClick}
              type="button"
              variant="outlined"
            >
              Back
            </Button>
          }
          {!hideNextButton &&
            <Button
              disabled={disabledNext || dataLoading}
              onClick={onNextClick}
              type="button"
              variant="contained"
            >
              {isLastCard ? 'Finish' : 'Next'}
            </Button>
          }
        </CardActions>
      </Box>
    </Card>
  )
}

export default WindowCard
