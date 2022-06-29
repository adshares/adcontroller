import React from 'react'
import styles from './styles.scss'
import { Button, Card, CardActions, CardContent, CardHeader } from '@mui/material'

const WindowCard = ({
  children,
  title,
  onNextClick,
  onBackClick,
  disabledNext = false,
  isFirstCard = false,
  isLastCard = false,
}) => {
  return (
    <Card className={styles.container}>
      <CardHeader title={title}/>
      <CardContent className={styles.content}>{children}</CardContent>
      <CardActions className={styles.controls}>
        {!isFirstCard &&
          <Button
            onClick={onBackClick}
            type="button"
            variant="outlined"
          >
            Back
          </Button>
        }
        {!isLastCard &&
          <Button
            disabled={disabledNext}
            onClick={onNextClick}
            type='button'
            variant="contained"
          >
            Next
          </Button>
        }
      </CardActions>
    </Card>
  )
}

export default WindowCard
