import { FC, useEffect, useState } from "react";
import { BoreholeAttachment } from "../../../../../api/apiInterfaces.ts";
import { ProfileFilePicker } from "./profileFilePicker.tsx";
import { StratigraphyLabeling } from "./stratigraphyLabeling.tsx";

interface StratigraphyExtractionProps {
  boreholeId: string;
}

export const StratigraphyExtraction: FC<StratigraphyExtractionProps> = ({ boreholeId }) => {
  const [filePickerOpen, setFilePickerOpen] = useState(false);
  const [extractionOpen, setExtractionOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<BoreholeAttachment>();

  useEffect(() => {
    if (selectedFile) {
      setFilePickerOpen(false);
      setExtractionOpen(true);
    } else {
      setFilePickerOpen(true);
    }
  }, [selectedFile]);

  return (
    <>
      <ProfileFilePicker
        boreholeId={boreholeId}
        open={filePickerOpen}
        setOpen={setFilePickerOpen}
        setSelectedFile={setSelectedFile}
      />
      {selectedFile && <StratigraphyLabeling file={selectedFile} open={extractionOpen} setOpen={setExtractionOpen} />}
    </>
  );
};
