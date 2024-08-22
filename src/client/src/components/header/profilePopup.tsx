import { useAuth } from "react-oidc-context";
import { Button, IconButton, Popover, Stack, Typography } from "@mui/material";
import ProfileIcon from "../../assets/icons/profile.svg?react";
import { UserData } from "../../api-lib/ReduxStateInterfaces.ts";
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
      <IconButton onClick={handleClick} color="primary" aria-describedby={id}>
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
