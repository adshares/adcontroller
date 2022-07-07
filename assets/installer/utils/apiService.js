import configuration from '../../controllerConfig/configuration'
import { HttpError } from './errors'

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
  try {
    const apiCall = await request(`${configuration.baseUrl}/api/login`, 'POST', false, body)
    if(!apiCall.ok){
      throw new HttpError('Login error', await apiCall.json())
    }
    const response = await apiCall.json()

    if (response.token?.length) {
      localStorage.setItem('authToken', response.token)
      return response.token
    }
  } catch (err) {
    throw new HttpError(err.message, err.data)
  }
}

const logout = () => {
  localStorage.removeItem('authToken')
}

const sendStepData = async (stepName, body) => {
  try {
    const apiCall = await request(`${configuration.baseUrl}/api/step/${stepName}`, 'POST', true, body)
    if(!apiCall.ok){
      throw new HttpError('Send error', await apiCall.json())
    }
    return await apiCall.json()
  } catch (err) {
    throw new HttpError(err.message, err.data)
  }
}

const getPrevStep = async () => {
  try {
    const apiCall = await request(`${configuration.baseUrl}/api/step/`, 'GET', true)
    if(!apiCall.ok){
      throw new HttpError('Data error', await apiCall.json())
    }
    return await apiCall.json()
  } catch (err) {
    if (err.data.code === 401) {
      logout()
      throw new HttpError('Data error', err.data)
    }
  }
}

const getCurrentStepData = async (stepName) => {
  try {
    const apiCall = await request(`${configuration.baseUrl}/api/step/${stepName}`, 'GET', true)
    if(!apiCall.ok){
      throw new HttpError('Data error', await apiCall.json())
    }
    return await apiCall.json()
  } catch (err) {
    if (err.data.code === 401) {
      logout()
      throw new HttpError(err.message, err.data)
    }
  }
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
  try {
    const apiCall = await request(`${configuration.baseUrl}/api/node_host`, 'POST', true, body)
    if(!apiCall.ok){
      throw new HttpError('Data error', await apiCall.json())
    }
    return await apiCall.json()
  } catch (err) {
    if (err.data.code === 401) {
      logout()
      throw new HttpError(err.message, err.data)
    }
  }
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
