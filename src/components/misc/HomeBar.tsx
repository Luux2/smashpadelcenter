import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import NotificationSelector from "../NotificationSelector";
import { Bell } from "lucide-react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Popper,
  Paper,
  ClickAwayListener,
  Typography,
  Stack,
} from "@mui/material";
import BackArrow from "./BackArrow";

const HomeBar = ({ backPage }: { backPage?: string }) => {
  const { role, logout, username } = useUser();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleToggle = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleHomeClick = () => {
    navigate("/hjem");
  };

  const handleAdminClick = () => {
    navigate("/admin");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <BackArrow backPage={backPage} />
          <Button variant="text" onClick={handleHomeClick}>
            Hjem
          </Button>
          {role === "admin" && (
            <Button variant="text" onClick={handleAdminClick}>
              Admin Panel
            </Button>
          )}
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          {username && (
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              {username}
            </Typography>
          )}
          {username && (
            <Button variant="text" onClick={handleProfileClick}>
              Profile
            </Button>
          )}
          <IconButton onClick={handleToggle} size="large">
            <Bell />
          </IconButton>
          <Button variant="text" onClick={handleLogout}>
            Log ud
          </Button>
        </Stack>
      </Toolbar>

      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-end"
        style={{ zIndex: 1300 }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Paper elevation={6} sx={{ mt: 1, width: 380, p: 2 }}>
            <NotificationSelector userId={username || ""} />
          </Paper>
        </ClickAwayListener>
      </Popper>
    </AppBar>
  );
};

export default HomeBar;
