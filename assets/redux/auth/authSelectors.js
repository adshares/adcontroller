const getIsLoggedIn = (state) => state.authSlice.isLoggedIn;
const getUser = (state) => state.authSlice.user;

const authSelectors = {
  getIsLoggedIn,
  getUser,
};

export default authSelectors;
