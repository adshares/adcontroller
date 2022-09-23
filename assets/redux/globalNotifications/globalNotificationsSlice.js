import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  showNotification: false,
  notificationType: '',
  notificationTitle: '',
  notificationMessage: '',
};

const globalNotificationsSlice = createSlice({
  name: 'globalNotificationsSlice',
  initialState,
  reducers: {
    setNotification: (state, { payload }) => {
      state.showNotification = payload.showNotification;
      state.notificationType = payload.notificationType;
      state.notificationTitle =
        payload.notificationTitle || state.notificationType.charAt(0).toUpperCase() + state.notificationType.slice(1);
      state.notificationMessage = payload.notificationMessage;
    },
    closeNotification: (state) => {
      state.showNotification = false;
      state.notificationType = '';
      state.notificationTitle = '';
      state.notificationMessage = '';
    },
  },
});

export const { setNotification, closeNotification } = globalNotificationsSlice.actions;
export default globalNotificationsSlice.reducer;
