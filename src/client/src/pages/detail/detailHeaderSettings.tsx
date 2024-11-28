import { useHistory } from "react-router-dom";
import { Stack } from "@mui/material";
import { ReturnButton } from "../../components/buttons/buttons.tsx";
import { DetailHeaderStack } from "../../components/styledComponents.ts";

export const DetailHeaderSettings = () => {
  const history = useHistory();

  return (
    <DetailHeaderStack direction="row" alignItems="center">
      <Stack direction="row" sx={{ flex: "1 1 100%" }} alignItems={"center"}>
        <ReturnButton
          onClick={() => {
            history.push("/");
          }}
        />
      </Stack>
    </DetailHeaderStack>
  );
};
