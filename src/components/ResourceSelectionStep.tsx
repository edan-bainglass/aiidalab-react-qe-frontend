import { ResourcesType } from "../interfaces";

interface ResourceSelectionStepProps {
  resources?: ResourcesType | null;
  onChange: (resources: ResourcesType) => void;
  controls: React.ReactNode;
}

const ResourceSelectionStep: React.FC<ResourceSelectionStepProps> = ({
  resources,
  onChange,
  controls,
}) => {
  return (
    <div>
      <h2>Step 4: Choose computational resources</h2>
      {controls}
      <div
        style={{
          border: "1px dashed #ccc",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        Placeholder for Resources Selection
      </div>
    </div>
  );
};

export default ResourceSelectionStep;
