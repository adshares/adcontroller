import { createSlice } from '@reduxjs/toolkit';
import { authApi } from './authApi';

const initialState = {
  isLoggedIn: true,
  user: {
    name: null,
    roles: null,
  },
};

const authSlice = createSlice({
  name: 'authSlice',
  initialState,
  reducers: {
    setAppLogin: (state) => {
      state.isLoggedIn = true;
    },
    setAppLogout: (state) => {
      state.isLoggedIn = false;
      state.user.name = null;
      state.user.roles = null;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(authApi.endpoints.getCurrentUser.matchFulfilled, (state, { payload }) => {
      state.user = payload.data;
    });
  },
});

export const { setAppLogin, setAppLogout } = authSlice.actions;
export default authSlice.reducer;
