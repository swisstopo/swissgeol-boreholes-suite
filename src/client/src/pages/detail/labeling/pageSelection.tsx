import { FC } from "react";
import { Button, ButtonGroup, SxProps, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PageSelectionProps {
  count: number;
  activePage: number;
  setActivePage: (page: number) => void;
  sx?: SxProps;
}

export const PageSelection: FC<PageSelectionProps> = ({ count, activePage, setActivePage, sx }) => {
  return (
    <ButtonGroup variant="contained" sx={sx}>
      <Typography
        variant="h6"
        p={1}
        pr={count > 1 ? 0 : 1}
        m={0.5}
        sx={{ alignContent: "center" }}
        data-cy="labeling-page-count">
        {activePage} / {count}
      </Typography>
      {count > 1 && (
        <>
          <Button
            variant="text"
            color="secondary"
            onClick={() => {
              setActivePage(activePage - 1);
            }}
            disabled={activePage === 1}
            data-cy="labeling-page-previous">
            <ChevronLeft />
          </Button>
          <Button
            variant="text"
            color="secondary"
            onClick={() => {
              setActivePage(activePage + 1);
            }}
            disabled={activePage === count}
            data-cy="labeling-page-next">
            <ChevronRight />
          </Button>
        </>
      )}
    </ButtonGroup>
  );
};
