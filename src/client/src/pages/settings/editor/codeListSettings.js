import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
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
import { loadDomains, updateIdentifier } from "../../../api-lib/index";
import TranslationText from "../../../commons/form/translationText";
import produce from "immer";

const CodeListSettings = () => {
  const queryClient = useQueryClient();

  // Can be simplified once the new c# api is called.
  const domains = useQuery("domains", async () => {
    const resultFunction = await loadDomains();
    const result = await resultFunction();
    const domains = [];
    Object.entries(result.data)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, values]) => domains.push({ name: key, values: values }));
    return domains;
  });

  //Can be simplified once the new c# api is called.
  const mutation = useMutation(
    async params => {
      const result = await updateIdentifier(params.id, params.data);
      return result.data;
    },
    {
      onSuccess: (data, variables) => {
        // Invalidate and refetch
        // Variant 1 refetch whole domains object from server, with invalidate query
        // queryClient.invalidateQueries("domains");
        // Variant 2 update cached domains object with setQueryData and immer.js
        queryClient.setQueryData(["domains"], oldDomains =>
          produce(oldDomains, draft => {
            const list = draft.find(d => d.name === variables.codeList);
            const index = list.values.findIndex(
              code => code.id === variables.id,
            );
            if (index !== -1) {
              const code = list.values[index];
              code.de.text = variables.data.de;
              code.en.text = variables.data.en;
              code.fr.text = variables.data.fr;
              code.it.text = variables.data.it;
            }
          }),
        );
      },
    },
  );

  const [id, setId] = useState("");
  const [de, setDe] = useState("");
  const [fr, setFr] = useState("");
  const [it, setIt] = useState("");
  const [en, setEn] = useState("");
  const [codeList, setCodeList] = useState("");

  const reset = () => {
    setId("");
    setDe("");
    setFr("");
    setIt("");
    setEn("");
    setCodeList("");
  };

  if (domains.isLoading) return <LinearProgress />;
  return (
    <Box sx={{ padding: "2em" }}>
      <Stack direction="row" spacing={2}>
        <Form
          style={{
            flex: 1,
          }}>
          <Form.Group widths="equal">
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
            <Box style={{ visibility: id ? "visible" : "hidden" }}>
              <Form.Button
                label="&nbsp;"
                onClick={e => {
                  e.preventDefault();
                  mutation.mutate({
                    id: id,
                    codeList: codeList,
                    data: {
                      de: de,
                      fr: fr,
                      it: it,
                      en: en,
                    },
                  });
                }}>
                <span
                  style={{
                    whiteSpace: "nowrap",
                  }}>
                  <Icon name="save" />
                  <TranslationText id="save" />
                </span>
              </Form.Button>
              <div className="linker link" onClick={() => reset()}>
                <TranslationText id="reset" />
              </div>
            </Box>
          </Form.Group>
        </Form>
      </Stack>
      <Stack>
        {domains.data &&
          domains.data.map(d => (
            <Accordion key={d.name}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{d.name}</Typography>
              </AccordionSummary>
              <AccordionDetails name={d.name}>
                {d.values.length > 0 &&
                  d.values.map((val, idx) => (
                    <Box
                      className="selectable"
                      key={idx}
                      onClick={() => {
                        if (id === val.id) {
                          reset();
                        } else {
                          setId(val.id);
                          setDe(val.de.text);
                          setFr(val.fr.text);
                          setIt(val.it.text);
                          setEn(val.en.text);
                          setCodeList(d.name);
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
                        <div style={{ flex: "1 1 0" }}>{val.de.text}</div>
                        <div style={{ flex: "1 1 0" }}>{val.fr.text}</div>
                        <div style={{ flex: "1 1 0" }}>{val.it.text}</div>
                        <div style={{ flex: "1 1 0" }}>{val.en.text}</div>
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
