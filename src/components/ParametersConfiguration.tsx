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

import { getDefaultFormState } from "@rjsf/utils";
import { InputSchema } from "../interfaces";

// Input schema for each panel

// Built-in basic panels
const basicSettingsSchema: InputSchema = {
  schema: {
    type: "object",
    definitions: {
      relaxationTypes: {
        enum: [
          {
            name: "Structure as is",
            value: "none",
          },
          {
            name: "Positions only",
            value: "positions",
          },
          {
            name: "Full geometry",
            value: "positions-cell",
          },
        ],
      },
    },
    properties: {
      relax: {
        title: "Relaxation level",
        $ref: "#/definitions/relaxationTypes",
      },
      electronicType: {
        type: "string",
        title: "Electronic Type",
        enum: ["Metallic", "Insulator"],
        default: "Metallic",
      },
      spinType: {
        type: "boolean",
        title: "Magnetism",
      },
      spinOrbit: {
        type: "boolean",
        title: "Spin Orbit Coupling",
      },
      protocol: {
        type: "string",
        title: "Protocol",
        enum: ["Fast", "Balanced", "Stringent"],
        default: "Fast",
      },
    },
  },
  ui: {
    relax: {
      "ui:widget": "RadioWidget",
      "ui:enumNames": ["Structure as is", "Positions only", "Full geometry"],
    },
    electronicType: {
      "ui:widget": "RadioWidget",
    },
    protocol: {
      "ui:widget": "RadioWidget",
    },
  },
};

// Built-in advanced panels
const advancedSettingsSchema: Record<string, InputSchema> = {
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
          default: "Gaussian",
        },
        width: { type: "number", title: "Width (eV)", default: 0.05 },
      },
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
  },
  hubbardU: {
    schema: {
      type: "object",
      title: "Hubbard U",
      properties: {
        useHubbard: { type: "boolean", title: "Enable U" },
        U: { type: "number", title: "U (eV)", default: 4.0 },
      },
    },
  },
  pseudopotentials: {
    schema: {
      type: "object",
      title: "Pseudopotentials",
      properties: {
        functional: {
          type: "string",
          title: "Functional",
          enum: ["PBE", "PBEsol"],
          default: "PBEsol",
        },
        family: {
          type: "string",
          title: "Family",
          enum: ["SSSP", "PseudoDojo"],
          default: "SSSP",
        },
        stringency: {
          type: "string",
          title: "Stringency",
          enum: ["standard", "stringent"],
          default: "standard",
        },
      },
    },
    ui: {
      stringency: {
        "ui:widget": "RadioWidget",
      },
    },
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
          <BasicSettings
            parameters={parameters}
            onFormChange={handleFormChange}
          />
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

interface BasicSettingsProps {
  parameters: Record<string, any>;
  onFormChange: (panelKey: string, formData: any) => void;
}

const BasicSettings: React.FC<BasicSettingsProps> = ({
  parameters,
  onFormChange,
}) => {
  useEffect(() => {
    const key = "basic";
    const schema = basicSettingsSchema.schema;
    if (parameters[key] === undefined) {
      const defaults = getDefaultFormState(validator, schema, {}, schema);
      onFormChange(key, defaults);
    }
  }, []);

  return (
    <div>
      <Form
        schema={basicSettingsSchema.schema}
        uiSchema={{
          ...basicSettingsSchema.ui,
          "ui:submitButtonOptions": { norender: true },
        }}
        formData={parameters["basic"]}
        onChange={(e) => onFormChange("basic", e.formData)}
        validator={validator}
        showErrorList={false}
        liveValidate
      ></Form>
    </div>
  );
};

interface AdvancedSettingsProps extends BasicSettingsProps {
  selectedProperties: string[];
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  selectedProperties,
  parameters,
  onFormChange,
}) => {
  const [loading, setLoading] = useState(true);
  const builtInKeys = Object.keys(advancedSettingsSchema);
  const pluginKeys = selectedProperties;
  const [schemasMap, setSchemasMap] = useState<Record<string, InputSchema>>(
    advancedSettingsSchema
  );
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

  useEffect(() => {
    Object.entries(advancedSettingsSchema).forEach(([key, { schema }]) => {
      if (parameters[key] === undefined) {
        const defaults = getDefaultFormState(validator, schema, {}, schema);
        onFormChange(key, defaults);
      }
    });
  }, []);

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
