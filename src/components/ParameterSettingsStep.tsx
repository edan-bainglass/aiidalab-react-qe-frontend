import Form from "@rjsf/react-bootstrap";
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

import { getDefaultFormState, RegistryWidgetsType } from "@rjsf/utils";
import { SwitchWidget, ToggleRadioWidget } from "../common/components";
import { InputSchema } from "../interfaces";

const widgets: RegistryWidgetsType = {
  RadioWidget: ToggleRadioWidget,
  CheckboxWidget: SwitchWidget,
};

// Built-in basic panels
const basicSettingsSchema: InputSchema = {
  schema: {
    type: "object",
    properties: {
      relax: {
        title: "Relaxation level",
        enum: ["none", "positions", "positions-cell"],
        default: "none",
      },
      electronic_type: {
        type: "string",
        title: "Electronic type",
        enum: ["Metallic", "Insulator"],
        default: "Metallic",
      },
      protocol: {
        type: "string",
        title: "Protocol",
        enum: ["Fast", "Balanced", "Stringent"],
        default: "Fast",
      },
      spin_type: {
        type: "boolean",
        title: "Magnetism",
      },
      spin_orbit: {
        type: "boolean",
        title: "Spin orbit coupling",
      },
    },
  },
  ui: {
    relax: {
      "ui:widget": "radio",
      "ui:enumNames": ["Structure as is", "Positions only", "Full geometry"],
    },
    electronic_type: {
      "ui:widget": "radio",
    },
    protocol: {
      "ui:widget": "radio",
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
          title: "Energy tolerance",
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
          title: "Initial magnetization",
          default: 0.5,
        },
      },
    },
  },
  hubbardU: {
    schema: {
      type: "object",
      title: "HubbardU",
      properties: {
        use_hubbard: {
          default: false,
          title: "Enable U",
          type: "boolean",
        },
      },
      required: ["use_hubbard"],
      if: {
        properties: {
          use_hubbard: {
            const: true,
          },
        },
      },
      then: {
        properties: {
          U: {
            default: 4.0,
            minimum: 0,
            title: "U (eV)",
            type: "number",
          },
        },
        required: ["U"],
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
      functional: {
        "ui:widget": "radio",
      },
      family: {
        "ui:widget": "radio",
      },
      stringency: {
        "ui:widget": "radio",
      },
    },
  },
};

interface ParameterSettingsStepProps {
  selectedProperties: string[];
  parameters: any;
  onChange: (panelKey: string, formData: any) => void;
  onConfirm: () => void;
  onBack: () => void;
}

const ParameterSettingsStep: React.FC<ParameterSettingsStepProps> = ({
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
        widgets={widgets}
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
            "ui:options": { title: "" },
          }}
          widgets={widgets}
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

export default ParameterSettingsStep;
