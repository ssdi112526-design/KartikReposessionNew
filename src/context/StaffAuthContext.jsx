import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { staffAuthService } from '../services';

const StaffAuthContext = createContext(null);
const STAFF_TOKEN_KEY = 'kra_staff_token';

export function StaffAuthProvider({ children }) {
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STAFF_TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    staffAuthService
      .me()
      .then((res) => setStaff(res.data.data.staff))
      .catch(() => {
        localStorage.removeItem(STAFF_TOKEN_KEY);
        setStaff(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const res = await staffAuthService.login(credentials);
    const { token, staff: loggedIn } = res.data.data;
    localStorage.setItem(STAFF_TOKEN_KEY, token);
    setStaff(loggedIn);
    return loggedIn;
  };

  const logout = async () => {
    try {
      await staffAuthService.logout();
    } catch {
      /* ignore */
    }
    localStorage.removeItem(STAFF_TOKEN_KEY);
    setStaff(null);
  };

  const value = useMemo(
    () => ({ staff, loading, login, logout, isStaff: Boolean(staff) }),
    [staff, loading]
  );

  return <StaffAuthContext.Provider value={value}>{children}</StaffAuthContext.Provider>;
}

export const useStaffAuth = () => {
  const ctx = useContext(StaffAuthContext);
  if (!ctx) throw new Error('useStaffAuth must be used within StaffAuthProvider');
  return ctx;
};

export { STAFF_TOKEN_KEY };
