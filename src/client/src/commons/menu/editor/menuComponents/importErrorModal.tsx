import { Header, Modal } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { ImportErrorModalProps } from "./menuComponentInterfaces";

export const ImportErrorModal = ({ setState, state }: ImportErrorModalProps) => {
  const { t } = useTranslation();
  return (
    <Modal
      closeIcon
      key="sb-em-5-2"
      onClose={() => {
        setState({
          validationErrorModal: false,
        });
      }}
      open={state.validationErrorModal === true}
      size="tiny">
      <Header content={t("validationErrorHeader")} />
      <Modal.Content style={{ maxHeight: "70vh", overflow: "auto" }} data-cy="borehole-import-error-modal-content">
        {state.errorResponse && (
          <div>
            {/* In case of API response type ProblemDetails */}
            {state.errorResponse.detail &&
              state.errorResponse.detail
                .split("\n")
                .filter((subString: string) => subString.includes("was not found"))
                .map((item: string, i: number) => <li key={item + i}>{item}</li>)}
            {/* In case of API response type ValidationProblemDetails */}
            {state.errorResponse.errors &&
              Object.entries(state.errorResponse.errors)
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
