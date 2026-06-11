import { useNavigate } from "react-router";
import { Box, Stack, Typography } from "@mui/material";
import { ChevronLeft } from "lucide-react";
import { BoreholesButton } from "../components/buttons/buttons.tsx";

export const NotFoundPage = ({ message }: { message: string }) => {
  const navigate = useNavigate();
  return (
    <Stack p={8} spacing={2}>
      <Typography variant="h4">{message}</Typography>
      <Box>
        <BoreholesButton
          label="backToOverview"
          variant="contained"
          onClick={() => navigate("/")}
          startIcon={<ChevronLeft />}
        />
      </Box>
    </Stack>
  );
};
