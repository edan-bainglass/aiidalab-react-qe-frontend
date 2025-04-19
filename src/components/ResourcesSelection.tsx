import { Button } from "react-bootstrap";

import { ResourcesType } from "../interfaces";

interface ResourcesSelectionProps {
  resources?: ResourcesType | null;
  onChange: (resources: ResourcesType) => void;
  onConfirm: () => void;
  onBack: () => void;
}

const ResourcesSelection: React.FC<ResourcesSelectionProps> = ({
  resources,
  onChange,
  onConfirm,
  onBack,
}) => {
  return (
    <div>
      <h2>Step 4: Choose computational resources</h2>
      <div
        style={{
          border: "1px dashed #ccc",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        Placeholder for Resources Selection
      </div>
      <div className="input-panel-controls">
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
    </div>
  );
};

export default ResourcesSelection;
