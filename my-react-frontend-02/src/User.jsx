import { useContext, useEffect, useState } from "react";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { DataGrid } from "@mui/x-data-grid";
import { Navigate } from "react-router-dom";

import { UserContext } from "./context/UserContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function User() {
  const { user } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = String(user?.id) === "-1";

  useEffect(() => {
    if (!isAdmin) return;

    let ignore = false;

    async function loadUsers() {
      try {
        const response = await fetch(`${API_URL}/api/user`, {
          credentials: "include",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message ?? "Unable to load users");
        }

        if (!ignore) setUsers(data.users ?? []);
      } catch (loadError) {
        if (!ignore) setError(loadError.message);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadUsers();

    return () => {
      ignore = true;
    };
  }, [isAdmin]);

  if (!isAdmin) return <Navigate to="/item" replace />;

  const openPasswordDialog = (selectedRow) => {
    setSelectedUser(selectedRow);
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  const closePasswordDialog = () => {
    if (!isSaving) setSelectedUser(null);
  };

  const changePassword = async () => {
    if (password.length < 6) {
      setError("Password must contain at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/user`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser._id,
          password,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Unable to change password");
      }

      setSelectedUser(null);
      setSuccess(`Password changed for ${selectedUser.username}`);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    { field: "username", headerName: "Username", flex: 1, minWidth: 150 },
    { field: "email", headerName: "Email", flex: 1.5, minWidth: 220 },
    { field: "firstname", headerName: "First name", flex: 1, minWidth: 140 },
    { field: "lastname", headerName: "Last name", flex: 1, minWidth: 140 },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 170,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button variant="outlined" onClick={() => openPasswordDialog(params.row)}>
          Change password
        </Button>
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <div>
        <Typography variant="h5">User management</Typography>
        <Typography color="text.secondary">
          Select a user to assign a new password.
        </Typography>
      </div>

      {error && !selectedUser && <Alert severity="error">{error}</Alert>}

      <DataGrid
        autoHeight
        rows={users}
        columns={columns}
        getRowId={(row) => row._id}
        loading={isLoading}
        disableRowSelectionOnClick
        pageSizeOptions={[10]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
        }}
      />

      <Dialog open={Boolean(selectedUser)} onClose={closePasswordDialog} fullWidth maxWidth="sm">
        <DialogTitle>Change user password</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography color="text.secondary">
              Set a new password for {selectedUser?.username}.
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              autoFocus
              required
              fullWidth
              type="password"
              label="New password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              helperText="Use at least 6 characters"
            />
            <TextField
              required
              fullWidth
              type="password"
              label="Confirm new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") changePassword();
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closePasswordDialog} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={changePassword} disabled={isSaving}>
            {isSaving ? "Saving..." : "Change password"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={4000}
        onClose={() => setSuccess("")}
        message={success}
      />
    </Stack>
  );
}
