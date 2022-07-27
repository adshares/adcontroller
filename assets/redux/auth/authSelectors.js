const getIsLoggedIn = (state) => state.authSlice.isLoggedIn;

const authSelectors = {
  getIsLoggedIn,
};

export default authSelectors;
