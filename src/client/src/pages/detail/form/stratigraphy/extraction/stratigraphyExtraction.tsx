import { FC, useCallback, useState } from "react";
import { BoreholeAttachment } from "../../../../../api/unionTypes.ts";
import { ProfileFilePicker } from "./profileFilePicker.tsx";
import { StratigraphyExtractionDialog } from "./stratigraphyExtractionDialog.tsx";

interface StratigraphyExtractionProps {
  boreholeId: number;
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

  const selectFileForExtraction = useCallback(
    (file: BoreholeAttachment | undefined) => {
      setSelectedFile(file);
      if (file) {
        setFilePickerOpen(false);
        setExtractionOpen(true);
      }
    },
    [setFilePickerOpen],
  );

  return (
    <>
      <ProfileFilePicker
        boreholeId={boreholeId}
        open={filePickerOpen}
        setOpen={setFilePickerOpen}
        setSelectedFile={selectFileForExtraction}
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
