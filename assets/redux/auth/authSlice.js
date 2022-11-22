import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: true,
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
    },
  },
});

export const { setAppLogin, setAppLogout, checkAppAuth } = authSlice.actions;
export default authSlice.reducer;
