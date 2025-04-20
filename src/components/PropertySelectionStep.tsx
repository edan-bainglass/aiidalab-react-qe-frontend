import React from "react";
import { Form } from "react-bootstrap";
import { Property } from "../interfaces";

interface PropertySelectionStepProps {
  available: Property[];
  selected: string[];
  onChange: (selected: string[]) => void;
  controls: React.ReactNode;
}

const PropertySelectionStep: React.FC<PropertySelectionStepProps> = ({
  available,
  selected,
  onChange,
  controls,
}) => {
  const handleToggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div>
      <h2>Step 2: Select properties to compute</h2>
      {controls}
      {available.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p>No properties available</p>
        </div>
      ) : (
        <Form>
          {available.map((prop) => (
            <Form.Check
              key={prop.id}
              type="checkbox"
              label={prop.label}
              checked={selected.includes(prop.id)}
              onChange={() => handleToggle(prop.id)}
            />
          ))}
        </Form>
      )}
    </div>
  );
};

export default PropertySelectionStep;
