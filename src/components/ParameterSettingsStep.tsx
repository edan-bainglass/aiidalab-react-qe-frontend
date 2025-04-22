import Form from "@rjsf/react-bootstrap";
import validator from "@rjsf/validator-ajv8";
import React, { useEffect, useState } from "react";
import { Dropdown, DropdownButton, Spinner, Tab, Tabs } from "react-bootstrap";

import {
  getDefaultFormState,
  RegistryWidgetsType,
  RJSFSchema,
  UiSchema,
} from "@rjsf/utils";

import { SwitchWidget, ToggleGroupWidget } from "../common/components";
import { InputSchema, StructureType } from "../interfaces";

const widgets: RegistryWidgetsType = {
  toggleGroup: ToggleGroupWidget,
  CheckboxWidget: SwitchWidget,
};

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
      "ui:widget": "toggleGroup",
      "ui:enumNames": ["Structure as is", "Positions only", "Full geometry"],
    },
    electronic_type: {
      "ui:widget": "toggleGroup",
    },
    protocol: {
      "ui:widget": "toggleGroup",
    },
  },
};

type SchemaMap = Record<string, InputSchema>;

const advancedSettingsSchema: SchemaMap = {
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
        pseudopotentials: {
          type: "array",
          title: "Pseudopotentials",
          items: {
            type: "string",
            format: "data-url",
            generatedFrom: "structure.species",
            pattern: "{{species}}",
          },
        },
      },
    },
    ui: {
      functional: {
        "ui:widget": "toggleGroup",
      },
      family: {
        "ui:widget": "toggleGroup",
      },
      stringency: {
        "ui:widget": "toggleGroup",
      },
      pseudopotentials: {
        "ui:options": {
          classNames: "mt-2",
        },
        items: {
          "ui:hideError": true,
          "ui:options": {
            accept: ".UPF",
          },
        },
      },
    },
  },
};

interface ParameterSettingsStepProps {
  structure: StructureType;
  selectedProperties: string[];
  parameters: any;
  onChange: (panelKey: string, formData: any) => void;
  controls: React.ReactNode;
  panel: string;
  onPanelChange: (panel: string) => void;
  advancedPanel: string;
  onAdvancedPanelChange: (panel: string) => void;
}

const ParameterSettingsStep: React.FC<ParameterSettingsStepProps> = ({
  structure,
  selectedProperties,
  parameters,
  onChange,
  controls,
  panel,
  onPanelChange: setPanel,
  advancedPanel,
  onAdvancedPanelChange: setAdvancedPanel,
}) => {
  const handleFormChange = (panelKey: string, formData: any) => {
    onChange(panelKey, formData);
  };

  return (
    <div>
      <h2>Step 3: Set calculation parameters</h2>
      {controls}
      <Tabs
        id="parameters-tabs"
        className="mb-3"
        style={{ marginTop: "1rem" }}
        activeKey={panel}
        onSelect={(key) => setPanel(key || "basic")}
      >
        <Tab eventKey="basic" title="Basic settings">
          <BasicSettings
            structure={structure}
            parameters={parameters}
            onFormChange={handleFormChange}
          />
        </Tab>
        <Tab eventKey="advanced" title="Advanced settings">
          <AdvancedSettings
            structure={structure}
            selectedProperties={selectedProperties}
            parameters={parameters}
            onFormChange={handleFormChange}
            activePanel={advancedPanel}
            onPanelChange={(panel) => setAdvancedPanel(panel)}
          />
        </Tab>
      </Tabs>
    </div>
  );
};

interface BasicSettingsProps {
  structure: StructureType;
  parameters: Record<string, any>;
  onFormChange: (panelKey: string, formData: any) => void;
}

const BasicSettings: React.FC<BasicSettingsProps> = ({
  structure,
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
  activePanel: string;
  onPanelChange: (panelKey: string) => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  structure,
  selectedProperties,
  parameters,
  onFormChange,
  activePanel,
  onPanelChange: setPanel,
}) => {
  const [loading, setLoading] = useState(true);
  const builtInKeys = Object.keys(advancedSettingsSchema);
  const pluginKeys = selectedProperties;
  const [schemasMap, setSchemasMap] = useState<SchemaMap>(
    advancedSettingsSchema
  );

  useEffect(() => {
    async function loadPluginSchemas() {
      try {
        const fetched: SchemaMap = {};
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
  const current = schemasMap[activePanel];

  const CategorySelector = () => {
    return (
      <DropdownButton
        title={current?.schema.title || activePanel}
        className="mb-3"
        onSelect={(key) => setPanel(key || "")}
      >
        {dropdownKeys.map((key) => (
          <Dropdown.Item key={key} eventKey={key}>
            {schemasMap[key]?.schema.title || key}
          </Dropdown.Item>
        ))}
      </DropdownButton>
    );
  };

  const { schema, ui } = processDependencies(current, structure);

  return (
    <div>
      {<CategorySelector />}

      {current && (
        <Form
          schema={schema}
          uiSchema={{
            ...ui,
            "ui:submitButtonOptions": { norender: true },
            "ui:options": { title: "" },
          }}
          widgets={widgets}
          formData={patchFormData(parameters[activePanel], schema)}
          onChange={(e) => onFormChange(activePanel, e.formData)}
          validator={validator}
          showErrorList={false}
          liveValidate
        />
      )}
    </div>
  );
};

export default ParameterSettingsStep;

const processDependencies = (
  input: InputSchema,
  structure: StructureType
): InputSchema => {
  const { schema: origSchema, ui: origUi } = input;

  const schema: RJSFSchema = {
    ...origSchema,
    properties: { ...(origSchema.properties || {}) },
  };
  const ui: UiSchema = { ...origUi };

  for (const [fieldKey, fieldDef] of Object.entries(schema.properties || {})) {
    const isArray = fieldDef?.type === "array";
    const items = (fieldDef as any)?.items;

    if (!isArray || !items || typeof items !== "object") continue;

    const generatedFrom = items.generatedFrom;
    if (!generatedFrom) continue;

    if (generatedFrom !== "structure.species") {
      console.warn(`Unsupported generatedFrom source: ${generatedFrom}`);
      continue;
    }

    const speciesKeys = Object.keys(structure.species || {});

    const itemSchemas = speciesKeys.map((symbol, i) => {
      const title = items.pattern
        .replace(/{{\s*species\s*}}/g, symbol)
        .replace(/{{\s*i\s*}}/g, String(i + 1));

      const newItem: any = {
        type: items.type,
        title,
        default: items.default,
      };

      if (items.format) newItem.format = items.format;
      if (items.default !== undefined) newItem.default = items.default;

      return newItem;
    });

    schema.properties![fieldKey] = {
      ...fieldDef,
      items: itemSchemas,
    };
  }

  return { schema, ui };
};

const patchFormData = (data: any, schema: RJSFSchema) => {
  if (!schema?.properties) return data;
  const copy = { ...data };

  for (const [fieldKey, fieldDef] of Object.entries(schema.properties)) {
    if (
      fieldDef?.type === "array" &&
      Array.isArray(fieldDef.items) &&
      (!Array.isArray(copy[fieldKey]) ||
        copy[fieldKey].length !== fieldDef.items.length)
    ) {
      copy[fieldKey] = Array(fieldDef.items.length).fill(undefined);
    }
  }

  return copy;
};
