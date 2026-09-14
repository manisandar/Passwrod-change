import Button from "@mui/material/Button";

import Card from "@mui/material/Card";

import CardContent from "@mui/material/CardContent";

import TextField from "@mui/material/TextField";

import Typography from "@mui/material/Typography";

import { useContext, useEffect, useRef } from "react";

import { UserContext } from "./context/UserContext";

import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const username = useRef("");

  const password = useRef("");

  const navigate = useNavigate();

  const { login, isLoggedIn, isLogInError, loginErrorMsg } =
    useContext(UserContext);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const onLogin = async () => {
    console.log("username: ", username.current.value);

    await login(username.current.value, password.current.value);
  };

  return (
    <div className="flex h-dvh justify-center items-center">
      {" "}
      <Card>
        {" "}
        <CardContent>
          {" "}
          <Typography sx={{ marginBottom: "10px" }} variant="h6">
            Login{" "}
          </Typography>{" "}
          <div className="mb-3">
            {" "}
            <TextField
              id="username"
              name="username"
              label="Username"
              inputRef={username}
            />{" "}
          </div>{" "}
          <div className="mb-3">
            {" "}
            <TextField
              type="password"
              id="password"
              name="password"
              label="Password"
              inputRef={password}
            />{" "}
          </div>{" "}
          <div className="flex justify-center">
            {" "}
            <Button variant="contained" onClick={onLogin}>
              Login{" "}
            </Button>{" "}
          </div>{" "}
          {isLogInError && (
            <div className="mt-3">
              {" "}
              <Typography color="error">{loginErrorMsg}</Typography>{" "}
            </div>
          )}{" "}
        </CardContent>{" "}
      </Card>{" "}
    </div>
  );
}
