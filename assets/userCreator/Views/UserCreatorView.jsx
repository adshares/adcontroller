import React, { useState } from 'react'
import { Button, Container, Grid, Typography, TextField, Alert } from '@mui/material'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles(() => ({
  paper: {
    marginTop: '25vh',
    textAlign: 'center'
  },
}))

const createUser = (userData) => {
  const request = new XMLHttpRequest()

  //Form Data
  // const formData = new FormData()
  // formData.append('email', userData.email)
  // formData.append('password', userData.password)

  request.open('POST', 'http://localhost:8030/api/accounts')
  request.send(JSON.stringify(userData))
}

export const UserCreatorView = () => {
  const classes = useStyles()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isFormDisabled, setFormStatus] = useState(false)
  // const dispatch = useDispatch()
  // const [createNewUser] = useCreateNewUserMutation()

  const handleSubmit = async e => {
    e.preventDefault()
    const userData = {
      email,
      password
    }
    createUser(userData)
    setFormStatus(!isFormDisabled)
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
              // type='email'
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
      {isFormDisabled && (
        <Alert severity='success' sx={{marginTop: '8px'}}>
          User was successfully created. Please refresh page to login.
        </Alert>
      )}
    </Container>
  )
}
