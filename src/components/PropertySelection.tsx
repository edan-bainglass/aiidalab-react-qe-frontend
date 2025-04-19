import React from "react";
import { Button, Form } from "react-bootstrap";
import { Property } from "../interfaces";

interface PropertySelectionProps {
  available: Property[];
  selected: string[];
  onChange: (selected: string[]) => void;
  onConfirm: () => void;
  onBack: () => void;
}

const PropertySelection: React.FC<PropertySelectionProps> = ({
  available,
  selected,
  onChange,
  onConfirm,
  onBack,
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
      <div className="input-panel-controls">
        <Button
          variant="secondary"
          onClick={onBack}
          style={{ marginRight: "10px" }}
        >
          Back
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Confirm Selections
        </Button>
      </div>
    </div>
  );
};

export default PropertySelection;
