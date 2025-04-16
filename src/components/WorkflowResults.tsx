import { Button } from "react-bootstrap";

const WorkflowResults = ({ onBack }: { onBack: () => void }) => {
  return (
    <div>
      <h2>Step 6: Monitor and Analyze Results</h2>
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

export default WorkflowResults;
