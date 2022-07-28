const getIsLoggedIn = (state) => state.authSlice.isLoggedIn;
const getToken = (state) => state.authSlice.token;

const authSelectors = {
  getIsLoggedIn,
  getToken,
};

export default authSelectors;
