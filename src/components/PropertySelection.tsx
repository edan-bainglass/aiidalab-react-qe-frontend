import { useEffect, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";

export interface Property {
  id: string;
  label: string;
  selected?: boolean;
}

const PropertySelector = ({
  onConfirm,
  onBack,
}: {
  onConfirm: (selected: Property[]) => void;
  onBack: () => void;
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("/api/plugins");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const fetchedProperties = await response.json();
        setProperties(
          fetchedProperties.map((prop: Property) => ({
            ...prop,
            selected: false,
          }))
        );
        setLoading(false);
      } catch (error) {
        console.error("Error fetching properties:", error);
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const toggleSelection = (key: string) => {
    setProperties((prev) =>
      prev.map((prop) =>
        prop.id === key ? { ...prop, selected: !prop.selected } : prop
      )
    );
  };

  const handleNext = () =>
    onConfirm(properties.filter((prop) => prop.selected));

  return (
    <div>
      <h2>Step 2: Calculation Selector</h2>
      {loading ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Spinner animation="border" />
          <p>Loading properties...</p>
        </div>
      ) : properties.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p>No properties available</p>
        </div>
      ) : (
        <Form>
          {properties.map((prop) => (
            <Form.Check
              key={prop.id}
              type="checkbox"
              label={prop.label}
              checked={prop.selected}
              onChange={() => toggleSelection(prop.id)}
            />
          ))}
        </Form>
      )}
      <div style={{ marginTop: "20px" }}>
        <Button
          variant="secondary"
          onClick={onBack}
          style={{ marginRight: "10px" }}
        >
          Back
        </Button>
        <Button variant="primary" onClick={handleNext}>
          Confirm Selections
        </Button>
      </div>
    </div>
  );
};

export default PropertySelector;
