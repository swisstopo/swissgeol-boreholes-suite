import { FC } from "react";
import { AddFileButton } from "../../../components/buttons/addFileButton.tsx";

interface AddAttachmentButtonProps {
  label: string;
  onFileSelect: (file: File) => Promise<void>;
  acceptedFileTypes?: string;
  dataCy?: string;
}

export const AddAttachmentButton: FC<AddAttachmentButtonProps> = ({
  label,
  onFileSelect,
  acceptedFileTypes,
  dataCy,
}) => {
  return (
    <AddFileButton
      label={label}
      onFileSelect={onFileSelect}
      acceptedFileTypes={acceptedFileTypes}
      sx={{ position: "absolute", top: "0", right: "0", mx: 2, my: 1 }}
      data-cy={dataCy}
    />
  );
};
