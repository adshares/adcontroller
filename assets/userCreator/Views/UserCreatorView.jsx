import React, { useState } from 'react'
import configuration from '../../controllerConfig/configuration'
import { Alert, Button, Container, Grid, TextField, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles(() => ({
  paper: {
    marginTop: '25vh',
    textAlign: 'center'
  },
}))

const createUser = async (userData) => {

  const response = await fetch (`${configuration.baseUrl}/api/accounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })
  const body = await response.json()
  return {
    status: response.status,
    message: body.message
  }
}

export const UserCreatorView = () => {
  const classes = useStyles()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isFormDisabled, setFormStatus] = useState(false)
  const [alert, setAlert] = useState({
    show: false,
    type: '',
    message:'',
  })

  const handleSubmit = async e => {
    e.preventDefault()
    const userData = {
      email,
      password
    }
    const response = await createUser(userData)
      if (response.status !== 201) {
        setAlert({
          show: true,
          type: 'error',
          message: response.message
        })
        return
      }

    setAlert({
      show: true,
      type: 'success',
      message: response.message
    })
    setFormStatus(!isFormDisabled)
    window.location.reload()
  }

  const handleInputChange = e => {
    const { name, value } = e.target

    switch (name) {
      case 'email':
        setEmail(value)
        break

      case 'password':
        setPassword(value)
        break

      default:
        return
    }
  }
  return (
    <Container component="main" maxWidth="sm" className={classes.paper}>
      <Typography component="h1" variant="h5" color={isFormDisabled ? 'grey.500' : 'primary'}>
          Create user
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              disabled={isFormDisabled}
              variant="standard"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              type='email'
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              disabled={isFormDisabled}
              variant="standard"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item />
        </Grid>
        <Button
          disabled={isFormDisabled}
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
        >
          Create
        </Button>
      </form>
      {alert.show && (
        <Alert severity={alert.type} sx={{marginTop: '8px'}}>
          {alert.message}
        </Alert>
      )}
    </Container>
  )
}

