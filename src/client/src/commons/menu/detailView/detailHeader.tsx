import { IconButton, Stack, Typography } from "@mui/material";
import { theme } from "../../../AppTheme";
import ArrowLeftIcon from "../../../../public/icons/arrow_left.svg?react";
import { useContext } from "react";
import { BoreholeDetailContext } from "../../../components/form/boreholeDetailContext";
import { useHistory } from "react-router-dom";

const DetailHeader = () => {
  const boreholeDetailContext = useContext(BoreholeDetailContext);
  const history = useHistory();

  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        borderBottom: "1px solid " + theme.palette.boxShadow,
        height: "84px",
        padding: "16px",
      }}>
      <IconButton
        data-cy="backButton"
        onClick={() => {
          history.push("/");
        }}
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: "white",
          width: "36px",
          height: "36px",
          marginRight: "18px",
          borderRadius: "2px",
          "&:hover": {
            opacity: 0.7,
            backgroundColor: theme.palette.primary.main,
          },
        }}>
        <ArrowLeftIcon />
      </IconButton>
      <Typography variant="h2"> {boreholeDetailContext.currentBorehole?.data.extended.original_name}</Typography>
    </Stack>
  );
};

export default DetailHeader;
