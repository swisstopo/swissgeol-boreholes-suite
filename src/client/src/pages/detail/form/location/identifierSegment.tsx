import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Card, Grid, IconButton, Typography } from "@mui/material";
import { Save, Trash2 } from "lucide-react";
import _ from "lodash";
import { addIdentifier, removeIdentifier, updateBorehole } from "../../../../api-lib";
import { Borehole, Identifier } from "../../../../api-lib/ReduxStateInterfaces.ts";
import { AlertContext } from "../../../../components/alert/alertContext.tsx";
import { FormValueType } from "../../../../components/form/form.ts";
import { SimpleDomainSelect } from "../../../../components/form/simpleDomainSelect.tsx";
import { SimpleFormInput } from "../../../../components/form/simpleFormInput.tsx";
import DomainText from "../../../../components/legacyComponents/domain/domainText.jsx";
import { FormSegmentBox } from "../../../../components/styledComponents";

interface IdentifierSegmentProps {
  borehole: Borehole;
  editingEnabled: boolean;
}
const IdentifierSegment = ({ borehole, editingEnabled }: IdentifierSegmentProps) => {
  const [identifierId, setIdentifierId] = useState<number | null>(null);
  const [identifierValue, setIdentifierValue] = useState<string>("");
  const { t } = useTranslation();
  const { showAlert } = useContext(AlertContext);
  const dispatch = useDispatch();

  const removeEntry = (identifier: Identifier) => {
    //@ts-expect-error // legacy fetch functions not typed
    removeIdentifier(borehole.data.id, identifier.id).then(response => {
      if (response.data.success) {
        const tmp = _.cloneDeep(borehole.data);
        if (tmp.custom.identifiers.length === 1) {
          tmp.custom.identifiers = [];
        } else {
          tmp.custom.identifiers = tmp.custom.identifiers.filter(el => el.id !== identifier.id);
        }
        dispatch(updateBorehole(tmp));
      }
    });
  };

  const addEntry = () => {
    // Check duplicate
    const alreadySet = borehole.data.custom.identifiers ? borehole.data.custom.identifiers.map(el => el.id) : [];

    if (identifierId && alreadySet.includes(identifierId)) {
      showAlert(t("msgIdentifierAlreadyUsed"), "error");
    } else {
      //@ts-expect-error // legacy fetch functions not typed
      addIdentifier(borehole.data.id, identifierId, identifierValue).then(response => {
        if (response.data.success) {
          setIdentifierId(null);
          setIdentifierValue("");
          const tmp = _.cloneDeep(borehole.data);
          if (tmp.custom.identifiers === null) {
            tmp.custom.identifiers = [];
          }
          tmp.custom.identifiers.push(response.data.data);
          dispatch(updateBorehole(tmp));
        }
      });
    }
  };

  return (
    <Card>
      <FormSegmentBox>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="h6"> {t("borehole_identifier")}</Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="h6"> {t("borehole_identifier_value")}</Typography>
          </Grid>
          <Grid item xs={1} />
          <Grid item xs={6}>
            {t("borehole_technical_id")}
          </Grid>
          <Grid item xs={5}>
            {borehole.data.id}
          </Grid>
          <Grid item xs={1} />
          {borehole.data.custom.identifiers?.map(identifier => (
            <>
              <Grid item xs={6}>
                <DomainText id={identifier.id} schema="borehole_identifier" />
              </Grid>
              <Grid item xs={5}>
                {identifier.value}
              </Grid>
              <Grid item xs={1} sx={{ pt: "0 !important", textAlign: "right" }}>
                {editingEnabled && (
                  <IconButton
                    onClick={() => {
                      removeEntry(identifier);
                    }}
                    data-cy="identifier-delete">
                    {<Trash2 size={16} />}
                  </IconButton>
                )}
              </Grid>
            </>
          ))}
        </Grid>
        {editingEnabled && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6} sx={{ display: "flex" }}>
              <SimpleDomainSelect
                fieldName={"borehole_identifier"}
                label={"borehole_identifier"}
                schemaName={"borehole_identifier"}
                readonly={!editingEnabled}
                selected={identifierId}
                onUpdate={selected => {
                  setIdentifierId(selected);
                }}
              />
            </Grid>
            <Grid item xs={5} sx={{ display: "flex" }}>
              <SimpleFormInput
                label="borehole_identifier_value"
                readonly={!editingEnabled}
                value={identifierValue}
                type={FormValueType.Text}
                onUpdate={text => {
                  setIdentifierValue(text);
                }}
              />
            </Grid>
            <Grid item xs={1} sx={{ textAlign: "right" }}>
              <IconButton
                sx={{ mt: 2 }}
                onClick={addEntry}
                disabled={!(identifierId && identifierValue)}
                data-cy="identifier-add">
                {<Save />}
              </IconButton>
            </Grid>
          </Grid>
        )}
      </FormSegmentBox>
    </Card>
  );
};

export default IdentifierSegment;
