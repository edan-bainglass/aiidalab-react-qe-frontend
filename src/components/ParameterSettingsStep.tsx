import Form from "@rjsf/react-bootstrap";
import validator from "@rjsf/validator-ajv8";
import React, { useEffect, useState } from "react";
import { Dropdown, DropdownButton, Spinner, Tab, Tabs } from "react-bootstrap";

import { getDefaultFormState, RegistryWidgetsType } from "@rjsf/utils";

import { SwitchWidget, ToggleGroupWidget } from "../common/components";
import { StructureType } from "../interfaces";
import {
  advancedSettingsSchema,
  basicSettingsSchema,
  SchemaMap,
} from "../schemas";
import { patchFormData, processDependencies } from "../utils";

const widgets: RegistryWidgetsType = {
  toggleGroup: ToggleGroupWidget,
  CheckboxWidget: SwitchWidget,
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
  const [
    advancedSettingsSchemaWithPlugins,
    setadvancedSettingsSchemaWithPlugins,
  ] = useState<SchemaMap>(advancedSettingsSchema);

  useEffect(() => {
    async function loadPluginSchemas() {
      try {
        const fetched: SchemaMap = {};
        for (const key of pluginKeys) {
          const res = await fetch(`/api/plugins/${key}/input`);
          if (!res.ok) throw new Error("Failed to load schema");
          fetched[key] = await res.json();
        }
        setadvancedSettingsSchemaWithPlugins((prev) => ({
          ...prev,
          ...fetched,
        }));
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
  const current = advancedSettingsSchemaWithPlugins[activePanel];

  const CategorySelector = () => {
    return (
      <DropdownButton
        title={current?.schema.title || activePanel}
        className="mb-3"
        onSelect={(key) => setPanel(key || "")}
      >
        {dropdownKeys.map((key) => (
          <Dropdown.Item key={key} eventKey={key}>
            {advancedSettingsSchemaWithPlugins[key]?.schema.title || key}
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
