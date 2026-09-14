import { useEffect, useRef, useState } from "react";
import { UserContext } from "./UserContext";

const API_URL = import.meta.env.VITE_API_URL;

async function getCurrentUser() {
  const response = await fetch(`${API_URL}/api/me`, {
    credentials: "include",
  });

  if (!response.ok) return null;

  // The /api/me endpoint returns the user directly, not { user: ... }.
  return response.json();
}

export function UserProvider({ children }) {
  const isInit = useRef(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginErrorMsg, setLoginErrorMsg] = useState("");
  const [isLogInError, setIsLoginError] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (isInit.current) return;
    isInit.current = true;

    async function initializeUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setIsLoggedIn(currentUser !== null);
      } catch (error) {
        console.error("Unable to check the current user:", error);
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setIsInitializing(false);
      }
    }

    initializeUser();
  }, []);

  const login = async (email, password) => {
    setIsLoginError(false);
    setLoginErrorMsg("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setUser(null);
        setIsLoggedIn(false);
        setIsLoginError(true);
        setLoginErrorMsg(errorData.message ?? "Login failed");
        return false;
      }

      // Login only returns a success message, so request the user after the
      // authentication cookie has been created.
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsLoggedIn(currentUser !== null);
      return currentUser !== null;
    } catch (error) {
      console.error("Login request failed:", error);
      setUser(null);
      setIsLoggedIn(false);
      setIsLoginError(true);
      setLoginErrorMsg("Unable to connect to the server");
      return false;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) return false;

      setUser(null);
      setIsLoggedIn(false);
      return true;
    } catch (error) {
      console.error("Logout request failed:", error);
      return false;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        isLoggedIn,
        isLogInError,
        loginErrorMsg,
        isInitializing,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
