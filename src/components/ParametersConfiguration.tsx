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

const builtInSchemas: WorkflowInputs = {
  convergence: {
    schema: {
      type: "object",
      title: "Convergence",
      properties: {
        energyTolerance: {
          type: "number",
          title: "Energy Tolerance",
          default: 1e-5,
        },
        maxSteps: { type: "integer", title: "Max Steps", default: 100 },
      },
    },
    ui: {
      energyTolerance: { "ui:placeholder": "e.g. 1e-5" },
      maxSteps: { "ui:placeholder": "e.g. 100" },
    },
  },
  smearing: {
    schema: {
      type: "object",
      title: "Smearing",
      properties: {
        method: {
          type: "string",
          title: "Method",
          enum: ["Gaussian", "Methfessel-Paxton", "Fermi-Dirac"],
        },
        width: { type: "number", title: "Width (eV)", default: 0.05 },
      },
    },
    ui: {
      method: { "ui:widget": "select" },
      width: { "ui:placeholder": "e.g. 0.05" },
    },
  },
  magnetization: {
    schema: {
      type: "object",
      title: "Magnetization",
      properties: {
        initialMagnetization: {
          type: "number",
          title: "Initial Magnetization",
          default: 0.5,
        },
      },
    },
    ui: {
      initialMagnetization: { "ui:placeholder": "e.g. 0.5" },
    },
  },
  hubbardU: {
    schema: {
      type: "object",
      title: "Hubbard U",
      properties: {
        useHubbard: { type: "boolean", title: "Enable U" },
        UValue: { type: "number", title: "U Value (eV)", default: 4.0 },
      },
    },
    ui: {
      UValue: { "ui:placeholder": "e.g. 4.0" },
    },
  },
  pseudopotentials: {
    schema: {
      type: "object",
      title: "Pseudopotentials",
      properties: {
        type: { type: "string", title: "Type", enum: ["PAW", "USPP", "NCPP"] },
      },
    },
    ui: {
      type: { "ui:widget": "select" },
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
  const handleFormChange = (propKey: string, formData: any) => {
    setParameters((prev: any) => ({
      ...prev,
      [propKey]: formData,
    }));
  };

  const handleNext = () => {
    const allParameters = Object.keys(builtInSchemas).reduce(
      (acc, key) => ({
        ...acc,
        [key]: parameters[key] || builtInSchemas[key].data,
      }),
      {}
    );
    setParameters(allParameters);
    onConfirm();
  };

  return (
    <div>
      <h2>Step 3: Set calculation parameters</h2>
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
  onFormChange: (propKey: string, formData: any) => void;
}

const AdvancedSettings = ({
  selectedProperties,
  onFormChange,
}: AdvancedSettingsProps) => {
  const [loadingPlugins, setLoadingPlugins] = useState<boolean>(true);
  const builtInKeys = Object.keys(builtInSchemas);
  const pluginKeys = selectedProperties.map((p) => p.id);
  const [schemasMap, setSchemasMap] = useState(builtInSchemas);
  const [activeKey, setActiveKey] = useState<string>(builtInKeys[0]);

  useEffect(() => {
    const fetchPluginSchemas = async () => {
      try {
        const fetched: WorkflowInputs = {};
        for (const property of selectedProperties) {
          const response = await fetch(`/api/plugins/${property.id}/input`);
          if (!response.ok) throw new Error("Failed to fetch plugin schema");
          const data: InputSchema = await response.json();
          fetched[property.id] = data;
        }
        setSchemasMap((prev) => ({ ...prev, ...fetched }));
      } catch (error) {
        console.error("Error fetching plugin schemas:", error);
      } finally {
        setLoadingPlugins(false);
      }
    };
    if (pluginKeys.length > 0) fetchPluginSchemas();
    else setLoadingPlugins(false);
  }, [selectedProperties]);

  if (loadingPlugins) {
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Spinner animation="border" />
        <p>Loading advanced parameters...</p>
      </div>
    );
  }

  const dropdownKeys = [...builtInKeys, ...pluginKeys];
  const current = schemasMap[activeKey];

  return (
    <div>
      <p>Configure advanced calculation parameters.</p>
      <DropdownButton
        title={current?.schema.title || activeKey}
        className="mb-3"
      >
        {dropdownKeys.map((key) => (
          <Dropdown.Item key={key} onClick={() => setActiveKey(key)}>
            {schemasMap[key]?.schema.title || key}
          </Dropdown.Item>
        ))}
      </DropdownButton>

      {current && (
        <Form
          className={styles["input-panel"]}
          schema={current.schema}
          uiSchema={{
            ...current.ui,
            "ui:submitButtonOptions": { norender: true },
          }}
          formData={current.data}
          onChange={(e) => onFormChange(activeKey, e.formData)}
          validator={validator}
          showErrorList={false}
          liveValidate
        />
      )}
    </div>
  );
};

export default ParametersConfiguration;
