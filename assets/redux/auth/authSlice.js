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
      state.token = payload;
      state.isLoggedIn = true;
    },
    setAppLogout: (state) => {
      state.token = null;
      state.isLoggedIn = false;
    },
  },
});

export const { setAppLogin, setAppLogout } = authSlice.actions;
export default authSlice.reducer;
