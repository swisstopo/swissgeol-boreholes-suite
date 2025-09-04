import { FC } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress, Stack, Typography } from "@mui/material";
import { Trash2 } from "lucide-react";
import { FullPageCentered } from "../../../../../../components/styledComponents.ts";
import { useLithologies } from "../../lithology.ts";
import {
  AddRowButton,
  StratigraphyTableActionCell,
  StratigraphyTableCell,
  StratigraphyTableColumn,
  StratigraphyTableContent,
  StratigraphyTableGap,
  StratigraphyTableHeader,
  StratigraphyTableHeaderCell,
} from "../stratigraphyTableComponents.tsx";
import { useLithologyLabels } from "./useLithologyLabels.tsx";

interface LithologyContentEditProps {
  stratigraphyId: number;
}

export const LithologyContentEdit: FC<LithologyContentEditProps> = ({ stratigraphyId }) => {
  const { t } = useTranslation();
  const { data: lithologies, isLoading } = useLithologies(stratigraphyId);
  const { buildLithologyLabels } = useLithologyLabels();

  if (isLoading) {
    return (
      <FullPageCentered>
        <CircularProgress />
      </FullPageCentered>
    );
  }

  return (
    <>
      <Stack gap={1.5}>
        <Stack>
          <StratigraphyTableHeader>
            <StratigraphyTableHeaderCell sx={{ flex: "0 0 90px" }} label={t("depth")} />
            <StratigraphyTableHeaderCell label={t("lithology")} />
            <StratigraphyTableHeaderCell label={t("lithological_description")} />
            <StratigraphyTableHeaderCell label={t("facies_description")} />
          </StratigraphyTableHeader>
          <StratigraphyTableContent>
            <StratigraphyTableColumn sx={{ flex: "0 0 90px" }}>
              {!lithologies || lithologies.length === 0 ? (
                <StratigraphyTableCell>empty</StratigraphyTableCell>
              ) : (
                lithologies.map(lithology => (
                  <StratigraphyTableCell key={`depth-${lithology.id}`}>
                    <Typography>{`${lithology.fromDepth} m MD`}</Typography>
                    <Typography>{`${lithology.toDepth} m MD`}</Typography>
                  </StratigraphyTableCell>
                ))
              )}
            </StratigraphyTableColumn>
            <StratigraphyTableColumn>
              {!lithologies || lithologies.length === 0 ? (
                <StratigraphyTableGap />
              ) : (
                lithologies.map(lithology => (
                  <StratigraphyTableActionCell
                    key={`lithology-${lithology.id}`}
                    onClick={() => {
                      console.log("start editing lithology", lithology.id);
                    }}
                    topLabel={`${lithology.fromDepth} m MD`}
                    bottomLabel={`${lithology.toDepth} m MD`}
                    action={{
                      icon: <Trash2 />,
                      label: "Delete",
                      onClick: () => {
                        console.log("clicked delete lithology", lithology.id);
                      },
                    }}>
                    {buildLithologyLabels(lithology)}
                  </StratigraphyTableActionCell>
                ))
              )}
            </StratigraphyTableColumn>
            <StratigraphyTableColumn>
              <StratigraphyTableGap canEdit={true} />
              <StratigraphyTableActionCell>
                <Typography variant="body1">asdfas</Typography>
              </StratigraphyTableActionCell>
              <StratigraphyTableActionCell>
                <Typography variant="body1">asdfas</Typography>
              </StratigraphyTableActionCell>
            </StratigraphyTableColumn>
            <StratigraphyTableColumn>
              <StratigraphyTableActionCell>
                <Typography variant="body1">asdfas</Typography>
              </StratigraphyTableActionCell>
              <StratigraphyTableActionCell>
                <Typography variant="body1">asdfas</Typography>
              </StratigraphyTableActionCell>
              <StratigraphyTableGap canEdit={false} />
            </StratigraphyTableColumn>
          </StratigraphyTableContent>
        </Stack>
        <AddRowButton />
      </Stack>
    </>
  );
};
