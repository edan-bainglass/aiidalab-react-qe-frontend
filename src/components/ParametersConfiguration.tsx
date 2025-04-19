import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import React, { useEffect, useState } from "react";
import {
  Button,
  Dropdown,
  DropdownButton,
  Spinner,
  Tab,
  Tabs,
} from "react-bootstrap";

import { InputSchema } from "../interfaces";

// Input schema for each panel

// Built-in advanced panels
const builtInSchemas: Record<string, InputSchema> = {
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
    ui: { initialMagnetization: { "ui:placeholder": "e.g. 0.5" } },
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
    ui: { UValue: { "ui:placeholder": "e.g. 4.0" } },
  },
  pseudopotentials: {
    schema: {
      type: "object",
      title: "Pseudopotentials",
      properties: {
        type: { type: "string", title: "Type", enum: ["PAW", "USPP", "NCPP"] },
      },
    },
    ui: { type: { "ui:widget": "select" } },
  },
};

interface ParametersConfigurationProps {
  selectedProperties: string[];
  parameters: any;
  onChange: (panelKey: string, formData: any) => void;
  onConfirm: () => void;
  onBack: () => void;
}

const ParametersConfiguration: React.FC<ParametersConfigurationProps> = ({
  selectedProperties,
  parameters,
  onChange,
  onConfirm,
  onBack,
}) => {
  const handleFormChange = (panelKey: string, formData: any) => {
    onChange(panelKey, formData);
  };

  const handleNext = () => {
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
        unmountOnExit={false}
      >
        <Tab eventKey="basic" title="Basic settings">
          <BasicSettings />
        </Tab>
        <Tab eventKey="advanced" title="Advanced settings">
          <AdvancedSettings
            selectedProperties={selectedProperties}
            parameters={parameters}
            onFormChange={handleFormChange}
          />
        </Tab>
      </Tabs>
      <div className="input-panel-controls">
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

const BasicSettings: React.FC = () => (
  <div>
    <p>Configure basic settings for the calculation.</p>
    {/* TODO: implement basic settings form */}
  </div>
);

interface AdvancedSettingsProps {
  selectedProperties: string[];
  parameters: Record<string, any>;
  onFormChange: (panelKey: string, formData: any) => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  selectedProperties,
  parameters,
  onFormChange,
}) => {
  const [loading, setLoading] = useState(true);
  const builtInKeys = Object.keys(builtInSchemas);
  const pluginKeys = selectedProperties;
  const [schemasMap, setSchemasMap] =
    useState<Record<string, InputSchema>>(builtInSchemas);
  const [activeKey, setActiveKey] = useState<string>(builtInKeys[0]);

  useEffect(() => {
    async function loadPluginSchemas() {
      try {
        const fetched: Record<string, InputSchema> = {};
        for (const key of pluginKeys) {
          const res = await fetch(`/api/plugins/${key}/input`);
          if (!res.ok) throw new Error("Failed to load schema");
          fetched[key] = await res.json();
        }
        setSchemasMap((prev) => ({ ...prev, ...fetched }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (pluginKeys.length) loadPluginSchemas();
    else setLoading(false);
  }, [pluginKeys]);

  if (loading) {
    return (
      <div className="text-center mt-4">
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
          className="mb-3"
          schema={current.schema}
          uiSchema={{
            ...current.ui,
            "ui:submitButtonOptions": { norender: true },
          }}
          formData={parameters[activeKey]}
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
