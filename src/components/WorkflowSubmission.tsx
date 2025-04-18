import { Button } from "react-bootstrap";

const WorkflowSubmission = ({
  onConfirm,
  onBack,
}: {
  onConfirm: () => void;
  onBack: () => void;
}) => {
  return (
    <div>
      <h2>Step 5: Submit the workflow</h2>
      <div
        style={{
          border: "1px dashed #ccc",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        Placeholder for Preview and Submission details.
      </div>
      <Button
        variant="secondary"
        onClick={onBack}
        style={{ marginRight: "10px" }}
      >
        Back
      </Button>
      <Button variant="primary" onClick={onConfirm}>
        Submit Workflow
      </Button>
    </div>
  );
};

export default WorkflowSubmission;
