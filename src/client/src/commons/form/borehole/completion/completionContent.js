import Backfill from "./backfill";
import Instrumentation from "./instrumentation";

const CompletionContent = ({ completion, isEditable }) => {
  return (
    <div className="completionContent">
      <Instrumentation completionId={completion.id} isEditable={isEditable} />
      <Backfill completionId={completion.id} isEditable={isEditable} />
    </div>
  );
};

export default CompletionContent;
