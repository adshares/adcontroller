import configuration from '../../controllerConfig/configuration'

const authProvider = {
  login: async ({ username, password }) => {
    const response = await fetch(`${configuration.baseUrl}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({email: username, password})
    })
    const result = await response.json()

    if(result.token?.length){
      localStorage.setItem('authToken', result.token)
      return Promise.resolve()
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    return Promise.resolve();
  },

  checkError: () => Promise.resolve(),

  checkAuth: () => localStorage.getItem('authToken') ? Promise.resolve() : Promise.reject(),

  getPermissions: () => Promise.reject('Unknown method'),

  getIdentity: () => {
    if(localStorage.getItem('authToken'))
    Promise.resolve()
  },
};

export default authProvider
