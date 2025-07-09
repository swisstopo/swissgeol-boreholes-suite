import { ChangeEvent, FC, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button, SxProps } from "@mui/material";
import { Plus } from "lucide-react";

interface AddFileButtonProps {
  label: string;
  onFileSelect: (file: File) => Promise<void>;
  acceptedFileTypes?: string;
  dataCy?: string;
  sx?: SxProps;
}

export const AddFileButton: FC<AddFileButtonProps> = ({ label, onFileSelect, acceptedFileTypes, dataCy, sx }) => {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files && e.target?.files.length > 0) {
      const file = e.target.files[0];
      await onFileSelect(file);
    }
    formRef.current?.reset();
  };

  return (
    <form ref={formRef}>
      <Button
        component="label"
        role={undefined}
        variant="contained"
        endIcon={<Plus />}
        sx={{ height: "36px", ...sx }}
        data-cy={dataCy}>
        {t(label)}
        <input type="file" onChange={handleFileChange} style={{ display: "none" }} accept={acceptedFileTypes} />
      </Button>
    </form>
  );
};
