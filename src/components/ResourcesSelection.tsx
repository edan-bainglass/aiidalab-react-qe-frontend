import { Button } from "react-bootstrap";

const ResourcesSelection = ({
  onConfirm,
  onBack,
}: {
  onConfirm: () => void;
  onBack: () => void;
}) => {
  return (
    <div>
      <h2>Step 4: Resources Selection</h2>
      <div
        style={{
          border: "1px dashed #ccc",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        Placeholder for Resources Selection
      </div>
      <Button
        variant="secondary"
        onClick={onBack}
        style={{ marginRight: "10px" }}
      >
        Back
      </Button>
      <Button variant="primary" onClick={onConfirm}>
        Confirm Resources
      </Button>
    </div>
  );
};

export default ResourcesSelection;
