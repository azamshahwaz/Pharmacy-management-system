import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import API from "../services/apiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── REFRESH USER FROM COOKIE ───────────────────────────
const refreshUser = async () => {
  try {

    const { data } = await API.get("/users/profile");

    setUser(data.user || data.data || data);
  } catch (err) {

    setUser(null);
  }
};

  useEffect(() => {
    const init = async () => {
      await refreshUser();
      setLoading(false);
    };
    init();
  }, []);

  // ─── LOGIN ──────────────────────────────────────────────
  // Cookie is set by the server (httpOnly). We just fetch profile after.
  const login = async (credentials) => {
    const { data } = await API.post("/auth/login", credentials);
    await refreshUser();
    return data;
  };

  // ─── LOGOUT ─────────────────────────────────────────────
  const logout = async () => {
    try {
      await API.post("/auth/logout"); // server clears the httpOnly cookie
    } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);