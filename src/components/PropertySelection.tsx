import { useEffect, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";

interface Property {
  key: string;
  title: string;
}

const PropertySelector = ({
  onConfirm,
  onBack,
}: {
  onConfirm: (selected: string[]) => void;
  onBack: () => void;
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      const mockData: Property[] = [
        { key: "bands", title: "Band Structure" },
        { key: "pdos", title: "Projected DOS" },
        { key: "electronic_structure", title: "Electronic Structure" },
      ];
      setProperties(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const toggleSelection = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((v) => v !== key) : [...prev, key]
    );
  };

  const handleNext = () => onConfirm(selected);

  if (loading) {
    return <Spinner animation="border" />;
  }

  return (
    <div>
      <h2>Step 2: Calculation(s) Selector</h2>
      <Form>
        {properties.map((prop) => (
          <Form.Check
            key={prop.key}
            type="checkbox"
            label={prop.title}
            checked={selected.includes(prop.key)}
            onChange={() => toggleSelection(prop.key)}
          />
        ))}
      </Form>
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
