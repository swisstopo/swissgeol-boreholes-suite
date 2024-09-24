import React from "react";
import { useTranslation } from "react-i18next";
import { Header, Modal } from "semantic-ui-react";

import { ErrorResponse } from "../commons/actionsInterfaces.ts";

interface ImportErrorModalProps {
  errorResponse: ErrorResponse | null;
  setValidationErrorModal: React.Dispatch<React.SetStateAction<boolean>>;
  validationErrorModal: boolean;
}

export const ImportErrorModal = ({
  setValidationErrorModal,
  validationErrorModal,
  errorResponse,
}: ImportErrorModalProps) => {
  const { t } = useTranslation();
  return (
    <Modal
      closeIcon
      key="sb-em-5-2"
      onClose={() => {
        setValidationErrorModal(false);
      }}
      open={validationErrorModal}
      size="tiny">
      <Header content={t("validationErrorHeader")} />
      <Modal.Content style={{ maxHeight: "70vh", overflow: "auto" }} data-cy="borehole-import-error-modal-content">
        {errorResponse && (
          <div>
            {/* In case of API response type ProblemDetails */}
            {errorResponse.detail &&
              errorResponse.detail
                .split("\n")
                .filter((subString: string) => subString.includes("was not found"))
                .map((item: string, i: number) => <li key={item + i}>{item}</li>)}
            {/* In case of API response type ValidationProblemDetails */}
            {errorResponse.errors &&
              Object.entries(errorResponse.errors)
                // Only display error messages for keys that are not empty
                .filter(([key]) => key !== "")
                .map(([key, value], index) => (
                  <div key={key + index + 1}>
                    <div>{key}</div>
                    {value.map((item: string, i: string) => (
                      <li key={item + i}>{item}</li>
                    ))}
                  </div>
                ))}
          </div>
        )}
      </Modal.Content>
    </Modal>
  );
};
