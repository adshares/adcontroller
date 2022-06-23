import configuration from '../../controllerConfig/configuration'

const login = async (body) => {
  const request = await fetch(`${configuration.baseUrl}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  })
  const response = await request.json()

  if(request.status !== 200){
    return false
  }

  if(response.token?.length){
    localStorage.setItem('authToken', response.token)
    return response.token
  }
}

const logout = () => {
  localStorage.removeItem('authToken')
}

export default {
  login,
  logout
}
