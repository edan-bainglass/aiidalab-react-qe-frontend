import { useEffect, useState } from "react";
import { Form, Spinner } from "react-bootstrap";

import { PropertyMap } from "../interfaces";

interface PropertySelectionStepProps {
  properties: PropertyMap;
  onChange: (selected: PropertyMap) => void;
  controls: React.ReactNode;
}

const PropertySelectionStep: React.FC<PropertySelectionStepProps> = ({
  properties,
  onChange,
  controls,
}) => {
  const hasProperties = Object.keys(properties).length > 0;
  const [loading, setLoading] = useState(!hasProperties);

  const handleToggle = (id: string) => {
    const updatedProperties = { ...properties };
    updatedProperties[id].active = !updatedProperties[id].active;
    onChange(updatedProperties);
  };

  useEffect(() => {
    async function loadProperties() {
      try {
        const res = await fetch("/api/plugins");
        if (!res.ok) throw new Error("Failed to load plugins");
        const data: PropertyMap = await res.json();
        onChange(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    }
    !hasProperties && loadProperties();
  }, []);

  console.log(loading);

  return (
    <div>
      <h2>Step 2: Select properties to compute</h2>
      {controls}
      {loading ? (
        <div className="text-center mt-4">
          <Spinner animation="border" />
          <p>Loading properties...</p>
        </div>
      ) : Object.keys(properties).length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p>No properties available</p>
        </div>
      ) : (
        <Form>
          {Object.entries(properties).map(([key, prop]) => (
            <Form.Check
              key={key}
              type="checkbox"
              label={prop.label}
              checked={prop.active}
              onChange={() => handleToggle(key)}
            />
          ))}
        </Form>
      )}
    </div>
  );
};

export default PropertySelectionStep;
