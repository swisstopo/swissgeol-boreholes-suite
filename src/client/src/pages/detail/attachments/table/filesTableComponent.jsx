import { useContext } from "react";
import { withTranslation } from "react-i18next";
import { IconButton } from "@mui/material";
import { Checkbox, Icon, Table, TextArea } from "semantic-ui-react";
import { Trash2 } from "lucide-react";
import PropTypes from "prop-types";
import { downloadFile } from "../../../../api/file/file";
import DateText from "../../../../components/legacyComponents/dateText.js";
import { DetailContext } from "../../detailContext.tsx";
import DownloadLink from "../downloadlink.jsx";

const FilesTableComponent = props => {
  const { t } = props;
  const { editingEnabled } = useContext(DetailContext);
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
            {editingEnabled ? <Table.HeaderCell /> : null}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {props.files.map(boreholeFile => (
            <Table.Row key={"ftc-" + boreholeFile.fileId}>
              {props.editor === true && (
                <Table.Cell>
                  {editingEnabled ? (
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
                <DownloadLink caption={boreholeFile.file?.name} onDownload={() => downloadFile(boreholeFile.fileId)} />
              </Table.Cell>
              <Table.Cell>
                {editingEnabled ? (
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
                  {boreholeFile.user?.name}
                </span>
              </Table.Cell>
              {editingEnabled ? (
                <Table.Cell>
                  <IconButton
                    data-cy="attachments-detach-button"
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
};

FilesTableComponent.defaultProps = {
  editor: false,
  files: [],
  id: null,
};

const NamedFilesTableComponent = withTranslation("common")(FilesTableComponent);

export default NamedFilesTableComponent;
