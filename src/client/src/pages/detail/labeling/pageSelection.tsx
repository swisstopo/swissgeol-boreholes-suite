import { FC } from "react";
import { Button, ButtonGroup, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react";
import { labelingButtonStyles } from "./labelingStyles.ts";

const PageSelectionButton = styled(Button)(({ theme }) => ({
  "&.MuiButtonGroup-grouped": {
    marginLeft: theme.spacing(0.25),
    marginRight: theme.spacing(0.25),
  },
}));

interface PageSelectionProps {
  pageCount: number;
  activePage: number;
  setActivePage: (page: number) => void;
  files?: {
    count: number;
    active: number;
    setActive: (file: number) => void;
  };
}

export const PageSelection: FC<PageSelectionProps> = ({ pageCount, activePage, setActivePage, files }) => {
  const showFiles = !!files;
  const showPages = showFiles || pageCount > 1;

  return (
    <ButtonGroup variant="contained" sx={{ px: 0.25, ...labelingButtonStyles }}>
      {showFiles && (
        <PageSelectionButton
          variant="text"
          color="secondary"
          onClick={() => {
            files.setActive(files.active - 1);
          }}
          disabled={files.active === 1}
          data-cy="labeling-file-previous">
          <ChevronFirst />
        </PageSelectionButton>
      )}
      {showPages && (
        <PageSelectionButton
          variant="text"
          color="secondary"
          onClick={() => {
            setActivePage(activePage - 1);
          }}
          disabled={activePage === 1}
          data-cy="labeling-page-previous">
          <ChevronLeft />
        </PageSelectionButton>
      )}
      <Typography variant="h6" sx={{ alignContent: "center", px: 1 }} data-cy="labeling-page-count">
        {activePage} / {pageCount}
      </Typography>
      {showPages && (
        <PageSelectionButton
          variant="text"
          color="secondary"
          onClick={() => {
            setActivePage(activePage + 1);
          }}
          disabled={activePage === pageCount}
          data-cy="labeling-page-next">
          <ChevronRight />
        </PageSelectionButton>
      )}
      {showFiles && (
        <PageSelectionButton
          variant="text"
          color="secondary"
          onClick={() => {
            files.setActive(files.active + 1);
          }}
          disabled={files.active === files.count}
          data-cy="labeling-file-next">
          <ChevronLast />
        </PageSelectionButton>
      )}
    </ButtonGroup>
  );
};
