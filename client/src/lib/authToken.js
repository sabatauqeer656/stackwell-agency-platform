// Where the access token lives: in a plain variable, in memory, and nowhere else.
//
// Why not localStorage? Anything in localStorage can be read by ANY script on the page, so one injected
// script (XSS) could steal the login. A variable inside this module cannot be reached that way.
// The price: a page refresh forgets the token. That is fine, because the refresh token (kept in an httpOnly cookie
// that JavaScript cannot read at all) gets a new one in the background. See AuthProvider.
let accessToken = null;

export const getAccessToken = () => accessToken;
export const setAccessToken = (token) => {
  accessToken = token;
};

// The Axios layer calls this when the session cannot be renewed (the refresh token is expired or revoked),
// and the AuthProvider listens, so the screen can change to "please sign in again".
const listeners = new Set();
export const onAuthLost = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener); // call the returned function to stop listening
};
export const notifyAuthLost = () => {
  accessToken = null;
  listeners.forEach((listener) => listener());
};
