import React, { useState } from 'react'
import { Button, Container, Grid, Typography, TextField } from '@mui/material'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles(() => ({
  paper: {
    marginTop: '25vh',
    textAlign: 'center'
  },
}))

export const UserCreatorView = () => {
  const classes = useStyles()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // const dispatch = useDispatch()
  // const [createNewUser] = useCreateNewUserMutation()

  const handleSubmit = async e => {
    e.preventDefault()
    const userData = {
      email,
      password
    }
    console.log(userData)
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
    <Container component="main" maxWidth="xs">
      <div className={classes.paper}>
        <Typography component="h1" variant="h5" color="primary">
          Create user
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                variant="standard"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
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
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
          >
            Create
          </Button>
        </form>
      </div>
    </Container>
  )
}
