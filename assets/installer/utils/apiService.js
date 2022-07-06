import configuration from '../../controllerConfig/configuration'

const request = (url, method, withAuthorization = true, _body) => {
  return fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      ...(withAuthorization ? { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') } : {}),
    },
    ...(method === 'POST' ? { body: JSON.stringify(_body) } : {})
  })
}

const login = async (body) => {
  const apiCall = await request(`${configuration.baseUrl}/api/login`, 'POST', false, body)
  const response = await apiCall.json()

  if (apiCall.status !== 200) {
    return response
  }

  if (response.token?.length) {
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

  if (apiCall.status === 401) {
    logout()
    return
  }
  return await apiCall.json()

}

const getCurrentStepData = async (stepName) => {
  const apiCall = await request(`${configuration.baseUrl}/api/step/${stepName}`, 'GET', true)
  if (apiCall.status === 401) {
    logout()
    return
  }
  return await apiCall.json()
}

const getCommunityLicense = async () => {
  const apiCall = await request(`${configuration.baseUrl}/api/community_license`, 'GET', true)
  if (apiCall.status === 401) {
    logout()
    return
  }
  return await apiCall.json()
}

const getLicenseByKey = async (body) => {
  const apiCall = await request(`${configuration.baseUrl}/api/license_key`, 'POST', true, body)
  if (apiCall.status === 401) {
    logout()
    return
  }
  return await apiCall.json()
}

const getWalletNodeHost = async (body) => {
  const apiCall = await request(`${configuration.baseUrl}/api/node_host`, 'POST', true, body)
  if (apiCall.status === 401) {
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
  getCurrentStepData,
  getCommunityLicense,
  getLicenseByKey,
  getWalletNodeHost
}
