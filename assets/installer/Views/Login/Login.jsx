import React, { useState } from 'react'

import apiService from '../../utils/apiService'

import { Button, TextField } from '@mui/material'
import { WindowCard } from '../../Components/WindowCard/WindowCard'

export default function Login ({setToken}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    console.log(email, password)
    apiService.login({email, password}).then(response => setToken(response))
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
    <WindowCard title='Please login'>
      <form onSubmit={handleSubmit}>
        <TextField
          color="primary"
          variant="standard"
          margin="normal"
          required
          fullWidth
          id="email"
          type="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          onChange={handleInputChange}
          autoFocus
        />
        <TextField
          color="primary"
          variant="standard"
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
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
