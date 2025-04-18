import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import { useEffect, useState } from "react";
import { Button, Spinner, Tab, Tabs } from "react-bootstrap";

import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { Property } from "./PropertySelection";

import styles from "./ParametersConfiguration.module.scss";

interface ParametersConfigurationProps {
  selectedProperties: Property[];
  parameters: any;
  setParameters: (params: any) => void;
  onConfirm: () => void;
  onBack: () => void;
}

interface InputSchema {
  schema: RJSFSchema;
  ui: UiSchema;
}

interface InputModel extends InputSchema {
  data: any;
}

interface WorkflowInputs {
  [key: string]: InputModel;
}

const ParametersConfiguration = ({
  selectedProperties,
  parameters,
  setParameters,
  onConfirm,
  onBack,
}: ParametersConfigurationProps) => {
  const [localFormsData, setLocalFormsData] = useState<WorkflowInputs>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // console.log("Fetching input schemas for:", selectedProperties);
    const fetchSchemas = async () => {
      try {
        const schemas: any = {};
        for (const property of selectedProperties) {
          const response = await fetch(`/api/plugins/${property.id}/input`);
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data: InputSchema = await response.json();
          // console.log("Populating input schema for:", selectedProperties);
          // console.log(data);
          schemas[property.id] = data;
        }
        setLocalFormsData((prev: any) => ({
          ...prev,
          ...schemas,
        }));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching schemas:", error);
      }
    };

    fetchSchemas();
  }, [selectedProperties]);

  const handleFormChange = (propKey: string, formData: any) => {
    setLocalFormsData((prev: any) => ({
      ...prev,
      [propKey]: { ...prev[propKey], formData: formData },
    }));
  };

  const handleNext = () => {
    setParameters({ ...parameters, ...localFormsData });
    onConfirm();
  };

  return (
    <div>
      <h2>Step 3: Calculation Parameters Configuration</h2>
      {loading ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Spinner animation="border" />
          <p>Loading properties...</p>
        </div>
      ) : selectedProperties.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p>No properties selected</p>
        </div>
      ) : (
        <Tabs
          defaultActiveKey={selectedProperties[0].id}
          id="controlled-tab-example"
          className="mb-3"
          style={{ marginTop: "1rem" }}
        >
          <Tab eventKey="basic" title="Basic settings" key="basic">
            <BasicSettings />
          </Tab>
          <Tab eventKey="advanced" title="Advanced settings" key="advanced">
            <AdvancedSettings />
          </Tab>
          {selectedProperties.map((property) => (
            <Tab
              eventKey={property.id}
              title={localFormsData[property.id]?.schema.title || property.id}
              key={property.id}
            >
              <Form
                className={styles["input-panel"]}
                schema={localFormsData[property.id].schema}
                uiSchema={localFormsData[property.id].ui}
                formData={localFormsData[property.id]?.data}
                onChange={(e) => handleFormChange(property.id, e.formData)}
                validator={validator}
                showErrorList={false}
                liveValidate
              />
            </Tab>
          ))}
        </Tabs>
      )}
      <div className={styles["input-panel-controls"]}>
        <Button variant="secondary" onClick={onBack}>
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

const BasicSettings = () => {
  return (
    <div>
      <p>Configure basic settings for the calculation.</p>
      {/* Add your basic settings form here */}
    </div>
  );
};

const AdvancedSettings = () => {
  return (
    <div>
      <p>Configure advanced settings for the calculation.</p>
      {/* Add your advanced settings form here */}
    </div>
  );
};
