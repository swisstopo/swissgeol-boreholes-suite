import React, { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Icon, Form } from "semantic-ui-react";
import { loadDomains } from "../../../api-lib/index";
import TranslationText from "../../../commons/form/translationText";
import produce from "immer";
import { updateCodeLists, useDomains } from "../../../api/fetchApiV2";

const CodeListSettings = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const domains = useDomains();

  const mutation = useMutation(
    async params => {
      const result = await updateCodeLists(params);
      return result;
    },
    {
      onSuccess: (data, variables) => {
        queryClient.setQueryData(["domains"], oldDomains =>
          produce(oldDomains, draft => {
            const code = draft.find(d => d.id === data.id);
            if (code) {
              code.de = data.de;
              code.en = data.en;
              code.fr = data.fr;
              code.it = data.it;
              code.order = data.order;
            }
          }),
        );
      },
    },
  );

  const [id, setId] = useState("");
  const [geolcode, setGeolcode] = useState("-");
  const [de, setDe] = useState("");
  const [fr, setFr] = useState("");
  const [it, setIt] = useState("");
  const [en, setEn] = useState("");
  const [order, setOrder] = useState("");
  const [code, setCode] = useState({});

  const reset = () => {
    setId("");
    setGeolcode("-");
    setDe("");
    setFr("");
    setIt("");
    setEn("");
    setOrder("");
    setCode({});
  };

  if (domains.isLoading) return <LinearProgress />;
  const schemas = [...new Set(domains.data.map(d => d.schema))];
  return (
    <Box sx={{ padding: "2em" }}>
      <Stack
        direction="row"
        justifyContent="space-evenly"
        alignItems="flex-start"
        marginLeft={2}>
        <Form
          style={{
            flex: 1,
          }}>
          <Form.Group widths="equal">
            <Form.Input
              fluid
              readonly
              transparent
              name="geolcode"
              label="Geolcode"
              value={geolcode}
            />
            <Form.Input
              fluid
              name="german-input"
              label={<TranslationText id="german" />}
              onChange={e => {
                setDe(e.target.value);
              }}
              value={de}
            />
            <Form.Input
              fluid
              name="french-input"
              label={<TranslationText id="french" />}
              onChange={e => {
                setFr(e.target.value);
              }}
              value={fr}
            />
            <Form.Input
              fluid
              name="italian-input"
              label={<TranslationText id="italian" />}
              onChange={e => {
                setIt(e.target.value);
              }}
              value={it}
            />
            <Form.Input
              fluid
              name="english-input"
              label={<TranslationText id="english" />}
              onChange={e => {
                setEn(e.target.value);
              }}
              value={en}
            />
            <Form.Input
              fluid
              name="order-input"
              label={<TranslationText id="order" />}
              onChange={e => {
                setOrder(e.target.value);
              }}
              value={order}
            />
            <Box
              style={{
                visibility: id ? "visible" : "hidden",
                paddingTop: 20,
              }}>
              <Form.Button
                onClick={e => {
                  e.preventDefault();
                  mutation.mutate(
                    produce(code, draft => {
                      draft.de = de;
                      draft.fr = fr;
                      draft.en = en;
                      draft.it = it;
                      draft.order = order;
                    }),
                  );
                  dispatch(loadDomains());
                }}
                style={{ width: "120px" }}>
                <span
                  style={{
                    whiteSpace: "nowrap",
                  }}>
                  <Icon name="save" />
                  <TranslationText id="save" />
                </span>
              </Form.Button>
            </Box>
          </Form.Group>
        </Form>
      </Stack>
      <Stack sx={{ maxHeight: 400, overflow: "auto" }}>
        {domains.data &&
          schemas.map(s => (
            <Accordion key={s}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{s}</Typography>
              </AccordionSummary>
              <AccordionDetails name={s}>
                {domains.data.length > 0 &&
                  domains.data
                    .filter(d => d.schema === s)
                    .sort((a, b) => a.order - b.order)
                    .map((val, idx) => (
                      <Box
                        className="selectable"
                        key={idx}
                        onClick={() => {
                          if (id === val.id) {
                            reset();
                          } else {
                            setId(val.id);
                            setGeolcode(val.geolcode);
                            setDe(val.de);
                            setFr(val.fr);
                            setIt(val.it);
                            setEn(val.en);
                            setOrder(val.order);
                            setCode(val);
                          }
                        }}
                        sx={{
                          pb: 0.5,
                          backgroundColor: id === val.id ? "#595959" : null,
                          color: id === val.id ? "white" : null,
                        }}>
                        <Stack
                          direction="row"
                          justifyContent="space-evenly"
                          alignItems="flex-start"
                          spacing={2}>
                          <div style={{ flex: "1 1 0" }}>{val.geolcode}</div>
                          <div style={{ flex: "1 1 0" }}>{val.de}</div>
                          <div style={{ flex: "1 1 0" }}>{val.fr}</div>
                          <div style={{ flex: "1 1 0" }}>{val.it}</div>
                          <div style={{ flex: "1 1 0" }}>{val.en}</div>
                          <div style={{ flex: "1 1 0" }}>{val.order}</div>
                          <div style={{ width: "60px" }}></div>
                        </Stack>
                      </Box>
                    ))}
              </AccordionDetails>
            </Accordion>
          ))}
      </Stack>
    </Box>
  );
};

export default CodeListSettings;
