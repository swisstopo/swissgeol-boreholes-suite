import { useTranslation } from "react-i18next";
import { FormContainer, FormDisplay, FormValueType } from "../../../../components/form/form";
import { useGetCasingName } from "../completion/casingUtils.jsx";
import { Observation } from "./Observation.ts";

const ObservationDisplay = ({
  observation,
  showDepthInputs = true,
}: {
  observation: Observation;
  showDepthInputs?: boolean;
}) => {
  const { t } = useTranslation();
  const { getCasingNameWithCompletion } = useGetCasingName();

  function timesToReadableDuration(startTime: string, endTime: string) {
    const timestampStart = new Date(startTime).getTime();
    const timestampEnd = new Date(endTime).getTime();
    const durationInMinutes = (timestampEnd - timestampStart) / 60000;
    if (durationInMinutes < 0) return "-";
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = Math.floor(durationInMinutes % 60);
    let result = "";
    if (hours > 0) {
      result += hours + " " + (hours === 1 ? t("hour") : t("hours")) + " ";
    }
    if (minutes > 0) {
      result += minutes + " " + (minutes === 1 ? t("minute") : t("minutes"));
    }
    return result.trim();
  }

  return (
    <>
      {observation != null && (
        <>
          {showDepthInputs && (
            <>
              <FormContainer direction="row">
                <FormDisplay label="fromdepth" value={observation?.fromDepthM} type={FormValueType.Number} />
                <FormDisplay label="todepth" value={observation?.toDepthM} type={FormValueType.Number} />
              </FormContainer>
              <FormContainer direction="row">
                <FormDisplay label="fromDepthMasl" value={observation?.fromDepthMasl} type={FormValueType.Number} />
                <FormDisplay label="toDepthMasl" value={observation?.toDepthMasl} type={FormValueType.Number} />
              </FormContainer>
            </>
          )}
          <FormContainer direction="row">
            <FormDisplay label="startTime" value={observation?.startTime} type={FormValueType.DateTime} />
            <FormDisplay label="endTime" value={observation?.endTime} type={FormValueType.DateTime} />
          </FormContainer>
          <FormDisplay
            label="duration"
            value={
              observation?.startTime && observation.endTime
                ? timesToReadableDuration(observation?.startTime, observation?.endTime)
                : ""
            }
          />
          <FormContainer direction="row">
            <FormDisplay label="reliability" value={observation?.reliability ?? null} type={FormValueType.Domain} />
            <FormDisplay label="casingName" value={getCasingNameWithCompletion(observation)} />
          </FormContainer>
          <FormDisplay label="comment" value={observation?.comment} />
        </>
      )}
    </>
  );
};

export default ObservationDisplay;
