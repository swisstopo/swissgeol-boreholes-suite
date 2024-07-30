import { useAuth } from "react-oidc-context";
import { Button, IconButton, Popover, Stack, Typography } from "@mui/material";
import { theme } from "../../AppTheme.ts";
import ProfileIcon from "../../assets/icons/profile.svg?react";
import { UserData } from "../../ReduxStateInterfaces";
import { MouseEvent, useState } from "react";

export function ProfilePopup({ user }: { user: UserData }) {
  const auth = useAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(undefined);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <>
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
      <Popover
        anchorEl={anchorEl}
        id={id}
        open={open}
        onClose={handleClose}
        sx={{ marginTop: "5px" }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
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
