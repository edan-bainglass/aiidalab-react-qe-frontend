import { ResultsType } from "../interfaces";

interface WorkflowResultsStepProps {
  results?: ResultsType | null;
  controls: React.ReactNode;
}

const WorkflowResultsStep: React.FC<WorkflowResultsStepProps> = ({
  results,
  controls,
}) => {
  return (
    <div>
      <h2>Step 6: Monitor and analyze results</h2>
      {controls}
      <div
        style={{
          border: "1px dashed #ccc",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        Placeholder for Monitoring and Results Analysis.
      </div>
    </div>
  );
};

export default WorkflowResultsStep;
