import configuration from '../../controllerConfig/configuration'

const request = (url, method, withAuthorization = true, _body) => {
  return fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    ...(withAuthorization ? {'Authorization': 'Bearer ' + localStorage.getItem('authToken')} : {}),
    },
    ...(method === 'POST' ? {body: JSON.stringify(_body)} : {})
  })
}

const login = async (body) => {
  const apiCall = await request(`${configuration.baseUrl}/api/login`, 'POST', false, body)
  const response = await apiCall.json()

  if(apiCall.status !== 200){
    return false
  }

  if(response.token?.length){
    localStorage.setItem('authToken', response.token)
    return response.token
  }
}

const logout = () => {
  localStorage.removeItem('authToken')
  location.reload()
}

const sendStepData = async (stepName, body) => {
  const apiCall = await request(`${configuration.baseUrl}/api/step/${stepName}`, 'POST', true, body)
  return await apiCall.json()
}

const getPrevStep = async () => {
  const apiCall = await request(`${configuration.baseUrl}/api/step/`, 'GET', true)

  if(apiCall.status === 401){
    logout()
    return
  }
  return await apiCall.json()

}

const getCurrentStepData = async (stepName) => {
  const apiCall = await request(`${configuration.baseUrl}/api/step/${stepName}`, 'GET', true)

  if(apiCall.status === 401){
    logout()
    return
  }
  return await apiCall.json()
}

export default {
  login,
  logout,
  sendStepData,
  getPrevStep,
  getCurrentStepData
}
