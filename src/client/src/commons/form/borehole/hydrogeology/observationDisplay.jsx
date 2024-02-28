import { useTranslation } from "react-i18next";
import { StackFullWidth } from "../../../../components/baseComponents";
import { FormDisplay, FormDisplayType } from "../../../../components/form/form";

const ObservationDisplay = props => {
  const { observation } = props;
  const { t } = useTranslation();

  function timesToReadableDuration(startTime, endTime) {
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
          <StackFullWidth direction="row" spacing={1}>
            <FormDisplay label="fromdepth" value={observation?.fromDepthM} />
            <FormDisplay label="todepth" value={observation?.toDepthM} />
          </StackFullWidth>
          <StackFullWidth direction="row" spacing={1}>
            <FormDisplay label="fromDepthMasl" value={observation?.fromDepthMasl} />
            <FormDisplay label="toDepthMasl" value={observation?.toDepthMasl} />
          </StackFullWidth>
          <StackFullWidth direction="row" spacing={1}>
            <FormDisplay label="startTime" value={observation?.startTime} type={FormDisplayType.DateTime} />
            <FormDisplay label="endTime" value={observation?.endTime} type={FormDisplayType.DateTime} />
          </StackFullWidth>
          <FormDisplay
            label="duration"
            value={
              observation?.startTime && observation.endTime
                ? timesToReadableDuration(observation?.startTime, observation?.endTime)
                : null
            }
          />
          <StackFullWidth direction="row" spacing={1}>
            <FormDisplay label="reliability" value={observation?.reliability} type={FormDisplayType.Domain} />
            <FormDisplay
              label="completionFinished"
              value={observation?.completionFinished}
              type={FormDisplayType.Boolean}
            />
          </StackFullWidth>
          <FormDisplay label="casingName" value={observation?.casingId ? observation?.casing?.name : null} />
          <FormDisplay label="comment" value={observation?.comment} />
        </>
      )}
    </>
  );
};

export default ObservationDisplay;
