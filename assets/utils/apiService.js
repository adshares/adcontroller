import configuration from '../controllerConfig/configuration';
import { HttpError } from './errors';
import { store } from '../redux/store';
import { setAppLogout } from '../redux/auth/authSlice';

const request = async (url, method, withAuthorization = true, _body) => {
  try {
    const token = store.getState().authSlice.token;
    const result = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(withAuthorization
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
      ...(method === 'POST'
        ? {
            body: JSON.stringify(_body),
          }
        : {}),
    });
    if (!result.ok) {
      throw new HttpError('Error', await result.json());
    }
    return await result.json();
  } catch (err) {
    switch (err.data.code) {
      case 401:
        store.dispatch(setAppLogout());
        throw new HttpError('Authorization error', err.data);

      case 422:
        throw new HttpError('Data error', err.data);

      default:
        throw new HttpError('Error', err.data);
    }
  }
};

const createUser = async (body) => {
  try {
    await request(`${configuration.basePath}/api/accounts`, 'POST', false, body);
  } catch (err) {
    throw new HttpError(err.message, err.data);
  }
};

const sendStepData = async (stepName, body) => {
  try {
    return await request(`${configuration.basePath}/api/step/${stepName}`, 'POST', true, body);
  } catch (err) {
    throw new HttpError(err.message, err.data);
  }
};

const getPrevStep = async () => {
  try {
    return await request(`${configuration.basePath}/api/step`, 'GET', true);
  } catch (err) {
    throw new HttpError(err.message, err.data);
  }
};

const getCurrentStepData = async (stepName) => {
  try {
    return await request(`${configuration.basePath}/api/step/${stepName}`, 'GET', true);
  } catch (err) {
    throw new HttpError(err.message, err.data);
  }
};

const getCommunityLicense = async () => {
  try {
    return await request(`${configuration.basePath}/api/community_license`, 'GET', true);
  } catch (err) {
    throw new HttpError(err.message, err.data);
  }
};

const getLicenseByKey = async (body) => {
  try {
    return await request(`${configuration.basePath}/api/license_key`, 'POST', true, body);
  } catch (err) {
    throw new HttpError(err.message, err.data);
  }
};

const getWalletNodeHost = async (body) => {
  try {
    return await request(`${configuration.basePath}/api/node_host`, 'POST', true, body);
  } catch (err) {
    throw new HttpError(err.message, err.data);
  }
};

const sendJoiningFee = async (walletAddress, amount) => {
  const body = {
    walletAddress,
    amount,
  };
  try {
    return await request(`${configuration.basePath}/api/joining_fee`, 'POST', true, body);
  } catch (err) {
    throw new HttpError(err.message, err.data);
  }
};

export default {
  createUser,
  sendStepData,
  getPrevStep,
  getCurrentStepData,
  getCommunityLicense,
  getLicenseByKey,
  getWalletNodeHost,
  sendJoiningFee,
};
