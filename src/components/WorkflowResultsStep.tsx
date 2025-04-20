import { Button } from "react-bootstrap";

import { ResultsType } from "../interfaces";

interface WorkflowResultsStepProps {
  results?: ResultsType | null;
  onBack: () => void;
}

const WorkflowResultsStep: React.FC<WorkflowResultsStepProps> = ({
  results,
  onBack,
}) => {
  return (
    <div>
      <h2>Step 6: Monitor and analyze results</h2>
      <div
        style={{
          border: "1px dashed #ccc",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        Placeholder for Monitoring and Results Analysis.
      </div>
      <Button variant="secondary" onClick={onBack}>
        Back
      </Button>
    </div>
  );
};

export default WorkflowResultsStep;
