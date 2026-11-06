import { useCallback, useEffect, useMemo, useState } from 'react';
import { rawApi, refreshSession } from '../../lib/axios.js';
import { onAuthLost, setAccessToken } from '../../lib/authToken.js';
import { queryClient } from '../../lib/queryClient.js';
import { AuthContext } from './AuthContext.js';

const signedOut = { status: 'unauthenticated', user: null };

// Knows who is signed in. It only wraps the /admin pages (see AdminRoot), so a visitor of the public
// website never triggers a login check.
export default function AuthProvider({ children }) {
  // 'loading' until we know. This is what stops the login page from flashing for someone who IS signed in.
  const [auth, setAuth] = useState({ status: 'loading', user: null });

  // When the page opens, the access token (which lives only in memory) is gone. If the visitor has a valid
  // refresh cookie from an earlier login, this quietly gets a new token, so a page refresh keeps them signed in.
  useEffect(() => {
    let active = true;
    refreshSession().then(
      (user) => active && setAuth({ status: 'authenticated', user }),
      () => active && setAuth(signedOut) // no cookie, or it expired: simply not signed in
    );
    return () => {
      active = false;
    };
  }, []);

  // The session could not be renewed in the middle of using the dashboard
  useEffect(
    () =>
      onAuthLost(() => {
        queryClient.clear(); // forget cached admin data
        setAuth(signedOut);
      }),
    []
  );

  const login = useCallback(async (email, password) => {
    const response = await rawApi.post('/auth/login', { email, password });
    setAccessToken(response.data.data.accessToken);
    setAuth({ status: 'authenticated', user: response.data.data.user });
  }, []);

  const logout = useCallback(async () => {
    try {
      await rawApi.post('/auth/logout'); // the server revokes every token of this user and clears the cookie
    } finally {
      // even if the request failed (offline), this browser forgets the user
      setAccessToken(null);
      queryClient.clear();
      setAuth(signedOut);
    }
  }, []);

  const value = useMemo(() => ({ ...auth, login, logout }), [auth, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
