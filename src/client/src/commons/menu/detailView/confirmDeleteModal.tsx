import { Button, Header, Icon, Modal } from "semantic-ui-react";
import TranslationText from "../../form/translationText.jsx";
import { useSelector } from "react-redux";
import { Borehole, ReduxRootState } from "../../../ReduxStateInterfaces";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { deleteBorehole } from "../../../api-lib";
import { ConfirmDeleteModalInterface } from "./confirmDeleteModalInterface";

export function ConfirmDeleteModal({ onClose, open, trigger }: ConfirmDeleteModalInterface) {
  const borehole: Borehole = useSelector((state: ReduxRootState) => state.core_borehole);
  const [deleting, setDeleting] = useState(false);
  const history = useHistory();

  const confirmDelete = async () => {
    setDeleting(true);
    await deleteBorehole(borehole.data.id);
    history.push("/");
  };

  return (
    <Modal closeIcon onClose={onClose} open={open} size="mini" trigger={trigger}>
      <Header content={<TranslationText id="deleteForever" />} />
      <Modal.Content>
        <p>
          <TranslationText id="sure" />
        </p>
      </Modal.Content>
      <Modal.Actions>
        <Button negative loading={deleting} onClick={confirmDelete}>
          <Icon name="trash alternate" />
          &nbsp;
          <TranslationText id="delete" />
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
