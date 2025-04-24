import { FC, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@mui/material";
import { Plus } from "lucide-react";

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
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        sx={{ position: "absolute", top: "0", right: "0", mx: 2, my: 1 }}
        data-cy={dataCy}>
        {t(label)}
        <input type="file" onChange={handleFileChange} style={{ display: "none" }} accept={acceptedFileTypes} />
      </Button>
    </form>
  );
};
