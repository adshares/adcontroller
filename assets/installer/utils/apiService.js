import configuration from '../../controllerConfig/configuration'
import { HttpError } from './errors'

const request = async (url, method, withAuthorization = true, _body) => {
    const result =  await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(withAuthorization ? { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') } : {}),
      },
      ...(method === 'POST' ? { body: JSON.stringify(_body) } : {})
    })
    if(!result.ok){
      switch (result.code){
        case 401:
          logout()
          throw new HttpError('Authorization error', await result.json())

        case 422:
          throw new HttpError('Data error', await result.json())

        default:
          throw new HttpError('Error', await result.json())
      }
    }
    return await result.json()

}

const login = async (body) => {
  try {
    const response = await request(`${configuration.baseUrl}/api/login`, 'POST', false, body)
    if (response.token?.length) {
      localStorage.setItem('authToken', response.token)
      return response.token
    }
  } catch (err) {
    throw new HttpError(err.message, err.data)
  }
}

const logout = () => {
  const token = localStorage.getItem('authToken')
  if(token){
    localStorage.removeItem('authToken')
    location.reload()
  }
}

const sendStepData = async (stepName, body) => {
  try {
    return await request(`${configuration.baseUrl}/api/step/${stepName}`, 'POST', true, body)
  } catch (err) {
    throw new HttpError(err.message, err.data)
  }
}

const getPrevStep = async () => {
  try {
    return await request(`${configuration.baseUrl}/api/step/`, 'GET', true)
  } catch (err) {
    throw new HttpError(err.message, err.data)
  }
}

const getCurrentStepData = async (stepName) => {
  try {
    return await request(`${configuration.baseUrl}/api/step/${stepName}`, 'GET', true)

  } catch (err) {
    throw new HttpError(err.message, err.data)
  }
}

const getCommunityLicense = async () => {
  try {
    return await request(`${configuration.baseUrl}/api/community_license`, 'GET', true)
  } catch (err) {
    throw new HttpError(err.message, err.data)
  }
}

const getLicenseByKey = async (body) => {
  try {
    return await request(`${configuration.baseUrl}/api/license_key`, 'POST', true, body)
  } catch (err) {
    throw new HttpError(err.message, err.data)
  }
}

const getWalletNodeHost = async (body) => {
  try {
    return await request(`${configuration.baseUrl}/api/node_host`, 'POST', true, body)
  } catch (err) {
    throw new HttpError(err.message, err.data)
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
