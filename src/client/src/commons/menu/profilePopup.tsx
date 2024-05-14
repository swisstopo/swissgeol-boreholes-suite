import { useAuth } from "react-oidc-context";
import { Popup } from "semantic-ui-react";
import { Box, Button, Stack } from "@mui/material";
import { theme } from "../../AppTheme.js";
import { UserData } from "../form/borehole/segments/userInterface";
import ProfileIcon from "../../../public/icons/profile.svg?react";

export function ProfilePopup({ user }: { user: UserData }) {
  const auth = useAuth();
  return (
    <Popup on="click" trigger={<ProfileIcon />}>
      <Stack
        direction="row"
        sx={{
          minWidth: "200px",
          padding: "0.5em",
        }}>
        {user !== null && (
          <>
            <Stack
              sx={{
                flex: "1 1 100%",
              }}>
              <Box>{user.name}</Box>
              <Box
                sx={{
                  color: theme.typography.subtitle2,
                  fontSize: "0.8em",
                }}>
                {user.username}
              </Box>
            </Stack>
            <Button
              onClick={() => {
                auth.signoutRedirect();
              }}>
              Logout
            </Button>
          </>
        )}
      </Stack>
    </Popup>
  );
}
