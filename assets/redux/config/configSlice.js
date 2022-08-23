import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  appData: {},
};

const configSlice = createSlice({
  name: 'configSlice',
  initialState,
  reducers: {
    setConfig: (state, { payload }) => {
      state.appData = payload;
    },
  },
});

export const { setConfig } = configSlice.actions;
export default configSlice.reducer;
