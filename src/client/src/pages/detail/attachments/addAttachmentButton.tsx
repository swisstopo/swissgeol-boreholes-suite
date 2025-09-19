import { FC } from "react";
import { AddFileButton } from "../../../components/buttons/addFileButton.tsx";

interface AddAttachmentButtonProps {
  label: string;
  onFileSelect: (file: File) => Promise<void>;
  acceptedFileTypes?: string;
}

export const AddAttachmentButton: FC<AddAttachmentButtonProps> = ({ label, onFileSelect, acceptedFileTypes }) => {
  return (
    <AddFileButton
      label={label}
      onFileSelect={onFileSelect}
      acceptedFileTypes={acceptedFileTypes}
      sx={{ position: "absolute", top: "0", right: "0", mx: 2, my: 1 }}
    />
  );
};
