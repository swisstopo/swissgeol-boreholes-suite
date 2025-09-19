import { FC, useEffect, useState } from "react";
import { BoreholeAttachment } from "../../../../../api/apiInterfaces.ts";
import { ProfileFilePicker } from "./profileFilePicker.tsx";
import { StratigraphyExtractionDialog } from "./stratigraphyExtractionDialog.tsx";

interface StratigraphyExtractionProps {
  boreholeId: string;
  filePickerOpen: boolean;
  setFilePickerOpen: (open: boolean) => void;
}

export const StratigraphyExtraction: FC<StratigraphyExtractionProps> = ({
  boreholeId,
  filePickerOpen,
  setFilePickerOpen,
}) => {
  const [extractionOpen, setExtractionOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<BoreholeAttachment>();

  useEffect(() => {
    if (selectedFile) {
      setFilePickerOpen(false);
      setExtractionOpen(true);
    }
  }, [selectedFile, setFilePickerOpen]);

  return (
    <>
      <ProfileFilePicker
        boreholeId={boreholeId}
        open={filePickerOpen}
        setOpen={setFilePickerOpen}
        setSelectedFile={setSelectedFile}
      />
      {selectedFile && (
        <StratigraphyExtractionDialog
          file={selectedFile}
          open={extractionOpen}
          setOpen={setExtractionOpen}
          setSelectedFile={setSelectedFile}
        />
      )}
    </>
  );
};
