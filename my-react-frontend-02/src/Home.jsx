import AppBar from "@mui/material/AppBar";

import Button from "@mui/material/Button";

import Toolbar from "@mui/material/Toolbar";

import Typography from "@mui/material/Typography";

import { Navigate, Outlet } from "react-router-dom";

import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";

import { useContext } from "react";

import { UserContext } from "./context/UserContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  const navigate = useNavigate();

  const { user, isLoggedIn, isInitializing } = useContext(UserContext);

  if (isInitializing) return <></>;

  if (!isLoggedIn || !user) return <Navigate to="/login" replace />;

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            My Frontend 1.0
          </Typography>
          <Button
            color="inherit"
            onClick={() => {
              navigate("/item");
            }}
          >
            Item
          </Button>
          {String(user.id) === "-1" && (
            <Button
              color="inherit"
              onClick={() => {
                navigate("/user");
              }}
            >
              User
            </Button>
          )}
          <Button
            color="inherit"
            onClick={async () => {
              const result = await fetch(`${API_URL}/api/auth/logout`, {
                credentials: "include",
              });

              if (result.ok) {
                window.location.reload(true);
              }
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ px: 2, pt: 2 }}>
        <Outlet />
      </Box>
    </div>
  );
}
