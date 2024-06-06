import { useAuth } from "react-oidc-context";
import { Button, IconButton, Popover, Stack, Typography } from "@mui/material";
import { theme } from "../../AppTheme.js";
import ProfileIcon from "../../../public/icons/profile.svg?react";
import { UserData } from "../../ReduxStateInterfaces";
import { useState } from "react";

export function ProfilePopup({ user }: { user: UserData }) {
  const auth = useAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const popoverTop = anchorEl?.getBoundingClientRect().bottom || 0;
  const popoverLeft = anchorEl?.getBoundingClientRect().left || 0;

  function ProfileButton() {
    return (
      <IconButton
        onClick={handleClick}
        aria-describedby={id}
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: "white",
          "&:hover": {
            opacity: 0.7,
            backgroundColor: theme.palette.primary.main,
          },
        }}>
        <ProfileIcon />
      </IconButton>
    );
  }

  return (
    <>
      <ProfileButton />
      <Popover
        anchorReference="anchorPosition"
        anchorPosition={{ top: popoverTop, left: popoverLeft }}
        id={id}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}>
        {user !== null && (
          <>
            <Stack sx={{ minWidth: "160px", padding: "12px" }}>
              <Typography sx={{ marginTop: "2px", marginBottom: "16px" }}>{user.name}</Typography>
              <Button
                variant="outlined"
                sx={{ margin: 0 }}
                onClick={() => {
                  auth.signoutRedirect();
                }}>
                Logout
              </Button>
            </Stack>
          </>
        )}
      </Popover>
    </>
  );
}
