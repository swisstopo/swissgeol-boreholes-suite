import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { Checkbox, Icon, Table, TextArea } from "semantic-ui-react";
import DateText from "../../../../components/legacyComponents/dateText.js";
import DownloadLink from "../downloadlink.jsx";
import { downloadBoreholeAttachment } from "../../../../api/fetchApiV2.js";
import { IconButton } from "@mui/material";
import { Trash2 } from "lucide-react";

const FilesTableComponent = props => {
  const { t } = props;
  return (
    <div
      className="flex_col flex_fill"
      style={{
        overflowY: "auto",
      }}>
      <Table singleLine>
        <Table.Header>
          <Table.Row>
            {props.editor === true && <Table.HeaderCell>{t("public")}</Table.HeaderCell>}
            <Table.HeaderCell>{t("name")}</Table.HeaderCell>
            <Table.HeaderCell>{t("description")}</Table.HeaderCell>
            <Table.HeaderCell>{t("type")}</Table.HeaderCell>
            <Table.HeaderCell>{t("uploaded")}</Table.HeaderCell>
            {props.unlocked === true ? <Table.HeaderCell /> : null}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {props.files.map(boreholeFile => (
            <Table.Row key={"ftc-" + boreholeFile.fileId}>
              {props.editor === true && (
                <Table.Cell>
                  {props.unlocked === true ? (
                    <Checkbox
                      checked={boreholeFile.public}
                      onChange={(e, d) => {
                        props.patchFile(
                          props.id,
                          boreholeFile.fileId,
                          boreholeFile.description,
                          boreholeFile.public,
                          "public",
                          d.checked,
                        );
                      }}
                    />
                  ) : boreholeFile.public === true ? (
                    <Icon color="green" name="lock open" />
                  ) : (
                    <Icon color="red" name="lock" />
                  )}
                </Table.Cell>
              )}
              <Table.Cell>
                <DownloadLink
                  caption={boreholeFile.file.name}
                  onDownload={() => downloadBoreholeAttachment(boreholeFile.fileId)}
                />
              </Table.Cell>
              <Table.Cell>
                {props.unlocked === true ? (
                  <TextArea
                    onChange={e => {
                      props.patchFile(
                        props.id,
                        boreholeFile.fileId,
                        boreholeFile.description,
                        boreholeFile.public,
                        "description",
                        e.target.value,
                      );
                    }}
                    rows={1}
                    value={boreholeFile.description}
                  />
                ) : (
                  boreholeFile.description
                )}
              </Table.Cell>
              <Table.Cell>{boreholeFile.file.type}</Table.Cell>
              <Table.Cell>
                <DateText date={boreholeFile.attached} hours />
                <br />
                <span
                  style={{
                    color: "#787878",
                  }}>
                  {boreholeFile.user.name}
                </span>
              </Table.Cell>
              {props.unlocked === true ? (
                <Table.Cell>
                  <IconButton
                    onClick={e => {
                      e.stopPropagation();
                      props.detachFile(props.id, boreholeFile.fileId);
                    }}
                    color="error">
                    <Trash2 />
                  </IconButton>
                </Table.Cell>
              ) : null}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

FilesTableComponent.propTypes = {
  detachFile: PropTypes.func,
  editor: PropTypes.bool,
  files: PropTypes.array,
  id: PropTypes.number,
  patchFile: PropTypes.func,
  reload: PropTypes.func,
  t: PropTypes.func,
  unlocked: PropTypes.bool,
};

FilesTableComponent.defaultProps = {
  editor: false,
  files: [],
  id: null,
  unlocked: false,
};

const NamedFilesTableComponent = withTranslation("common")(FilesTableComponent);

export default NamedFilesTableComponent;
