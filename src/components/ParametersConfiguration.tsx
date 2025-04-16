import Form from "@rjsf/core";
import { useEffect, useState } from "react";
import { Accordion, Button } from "react-bootstrap";

interface ParametersConfigurationProps {
  selectedProperties: string[];
  parameters: any;
  setParameters: (params: any) => void;
  onConfirm: () => void;
  onBack: () => void;
}

// Example JSON schemas for demonstration
const propertySchemas: Record<string, any> = {
  bands: {
    title: "Band Structure Parameters",
    type: "object",
    properties: {
      energy_cutoff: {
        type: "number",
        title: "Energy Cutoff (Ry)",
        default: 40,
      },
      kpoint_distance: {
        type: "number",
        title: "K-Point Distance",
        default: 0.1,
      },
    },
  },
  pdos: {
    title: "Projected DOS Parameters",
    type: "object",
    properties: {
      energy_range: {
        type: "string",
        title: "Energy Range",
        default: "0-100",
      },
    },
  },
  electronic_structure: {
    title: "Electronic Structure Parameters",
    type: "object",
    properties: {
      smearing: {
        type: "number",
        title: "Smearing (eV)",
        default: 0.02,
      },
    },
  },
};

const ParametersConfiguration = ({
  selectedProperties,
  parameters,
  setParameters,
  onConfirm,
  onBack,
}: ParametersConfigurationProps) => {
  const [localFormsData, setLocalFormsData] = useState<any>({});

  // Initialize local form data for each selected property.
  useEffect(() => {
    const initData: Record<string, any> = {};
    selectedProperties.forEach((prop) => {
      if (propertySchemas[prop] && !localFormsData[prop]) {
        initData[prop] = {};
      }
    });
    setLocalFormsData((prev: any) => ({ ...initData, ...prev }));
  }, [selectedProperties]);

  const handleFormChange = (propKey: string, formData: any) => {
    setLocalFormsData((prev: any) => ({
      ...prev,
      [propKey]: formData,
    }));
  };

  const handleNext = () => {
    // Merge the data from all forms into the global state.
    setParameters({ ...parameters, ...localFormsData });
    onConfirm();
  };

  return (
    <div>
      <h2>Step 3: Calculation Parameters Configuration</h2>
      {selectedProperties.length === 0 ? (
        <p>No calculation properties selected.</p>
      ) : (
        <Accordion>
          {selectedProperties.map((propKey) => (
            <Accordion.Item eventKey={propKey} key={propKey}>
              <Accordion.Header>
                {propertySchemas[propKey]?.title || propKey}
              </Accordion.Header>
              <Accordion.Body>
                <Form
                  schema={propertySchemas[propKey]}
                  formData={localFormsData[propKey]}
                  onChange={({ formData }) =>
                    handleFormChange(propKey, formData)
                  }
                >
                  <div /> {/* No submit button within individual forms */}
                </Form>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
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
          Confirm Parameters
        </Button>
      </div>
    </div>
  );
};

export default ParametersConfiguration;
