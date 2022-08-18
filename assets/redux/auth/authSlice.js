import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: 'authSlice',
  initialState,
  reducers: {
    setAppLogin: (state, { payload }) => {
      localStorage.setItem('authToken', payload);
      state.token = payload;
      state.isLoggedIn = true;
    },
    setAppLogout: (state) => {
      localStorage.removeItem('authToken');
      state.token = null;
      state.isLoggedIn = false;
    },
    checkAppAuth: (state) => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        state.token = null;
        state.isLoggedIn = false;
        return;
      }
      state.token = token;
      state.isLoggedIn = true;
    },
  },
});

export const { setAppLogin, setAppLogout, checkAppAuth } = authSlice.actions;
export default authSlice.reducer;
