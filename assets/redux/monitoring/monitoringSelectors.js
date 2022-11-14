const getMonitoringWalletInfo = (state) => state.monitoringSlice.monitoringData.wallet;
const getUsers = (state) => state.monitoringSlice.monitoringData.users;

const monitoringSelectors = {
  getMonitoringWalletInfo,
  getUsers,
};

export default monitoringSelectors;
