import React, { useState } from 'react'
import apiService from '../../utils/apiService'
import { Button, TextField } from '@mui/material'
import WindowCard from '../../Components/WindowCard/WindowCard'

export default function Login ({ setToken }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [alert, setAlert] = useState({type: '', message: ''})

  const handleSubmit = async e => {
    e.preventDefault()
    await login()
    // apiService.login({ email, password }).then(response => setToken(response))
  }

  const login = async () => {
    const response = await apiService.login({ email, password })
    if(response.code === 401){
      setAlert({
        type: 'error',
        message: response.message
      })
      return
    }
    setToken(response)
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
    <WindowCard
      alert={alert}
      title="Please login"
      isFirstCard
      isLastCard
    >
      <form onSubmit={handleSubmit}>
        <TextField
          variant="standard"
          margin="normal"
          required
          fullWidth
          type="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          onChange={handleInputChange}
        />
        <TextField
          variant="standard"
          margin="normal"
          required
          fullWidth
          type="password"
          label="Password"
          name="password"
          onChange={handleInputChange}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
        >
          Login
        </Button>
      </form>
    </WindowCard>
  )
}
