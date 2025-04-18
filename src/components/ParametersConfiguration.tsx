import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import { useEffect, useState } from "react";
import {
  Button,
  Spinner,
  Tab,
  Tabs,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";

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
  data?: any;
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

  const handleFormChange = (propKey: string, formData: any) => {
    setLocalFormsData((prev) => ({
      ...prev,
      [propKey]: { ...prev[propKey], data: formData },
    }));
  };

  const handleNext = () => {
    setParameters({ ...parameters, ...localFormsData });
    onConfirm();
  };

  return (
    <div>
      <h2>Step 3: Calculation Parameters Configuration</h2>
      <Tabs
        defaultActiveKey="basic"
        id="parameters-tabs"
        className="mb-3"
        style={{ marginTop: "1rem" }}
      >
        <Tab eventKey="basic" title="Basic settings" key="basic">
          <BasicSettings />
        </Tab>

        <Tab eventKey="advanced" title="Advanced settings" key="advanced">
          <AdvancedSettings
            selectedProperties={selectedProperties}
            localFormsData={localFormsData}
            setLocalFormsData={setLocalFormsData}
            onFormChange={handleFormChange}
          />
        </Tab>
      </Tabs>

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

interface AdvancedSettingsProps {
  selectedProperties: Property[];
  localFormsData: WorkflowInputs;
  setLocalFormsData: React.Dispatch<React.SetStateAction<WorkflowInputs>>;
  onFormChange: (propKey: string, formData: any) => void;
}

const AdvancedSettings = ({
  selectedProperties,
  localFormsData,
  setLocalFormsData,
  onFormChange,
}: AdvancedSettingsProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [activePluginId, setActivePluginId] = useState<string | null>(
    selectedProperties[0]?.id || null
  );

  useEffect(() => {
    const fetchSchemas = async () => {
      try {
        const schemas: Record<string, InputSchema> = {};
        for (const property of selectedProperties) {
          const response = await fetch(`/api/plugins/${property.id}/input`);
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data: InputSchema = await response.json();
          schemas[property.id] = data;
        }
        setLocalFormsData((prev) => ({
          ...prev,
          ...schemas,
        }));
      } catch (error) {
        console.error("Error fetching schemas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemas();
  }, [selectedProperties, setLocalFormsData]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Spinner animation="border" />
        <p>Loading properties...</p>
      </div>
    );
  }

  if (selectedProperties.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <p>No properties selected</p>
      </div>
    );
  }

  const currentForm = activePluginId && localFormsData[activePluginId];

  return (
    <div>
      <p>Configure advanced plugin-specific parameters.</p>
      <DropdownButton
        title={
          activePluginId
            ? localFormsData[activePluginId]?.schema.title || activePluginId
            : "Select a plugin"
        }
        className="mb-3"
      >
        {selectedProperties.map((property) => (
          <Dropdown.Item
            key={property.id}
            onClick={() => setActivePluginId(property.id)}
          >
            {localFormsData[property.id]?.schema.title || property.id}
          </Dropdown.Item>
        ))}
      </DropdownButton>

      {currentForm && (
        <Form
          className={styles["input-panel"]}
          schema={currentForm.schema}
          uiSchema={{
            ...currentForm.ui,
            "ui:submitButtonOptions": { norender: true },
          }}
          formData={currentForm.data}
          onChange={(e) => onFormChange(activePluginId!, e.formData)}
          validator={validator}
          showErrorList={false}
          liveValidate
        />
      )}
    </div>
  );
};
