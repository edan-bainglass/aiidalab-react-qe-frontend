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
import { patchDataIn, patchDataOut, patchSchema } from "../utils";

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
  const [advancedSettingsSchemas, setAdvancedSettingsSchemas] =
    useState<SchemaMap>(advancedSettingsSchema);

  useEffect(() => {
    async function loadPluginSchemas() {
      try {
        const fetched: SchemaMap = {};
        for (const property of selectedProperties) {
          const res = await fetch(`/api/plugins/${property}/input`);
          if (!res.ok) throw new Error("Failed to load schema");
          fetched[property] = await res.json();
        }
        setAdvancedSettingsSchemas((prev) => ({
          ...prev,
          ...fetched,
        }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (selectedProperties.length) loadPluginSchemas();
    else setLoading(false);
  }, [selectedProperties]);

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

  const categories = [
    ...Object.keys(advancedSettingsSchema),
    ...selectedProperties,
  ];

  const currentKey = advancedSettingsSchemas[activePanel]
    ? activePanel
    : "convergence";

  const current = advancedSettingsSchemas[currentKey];

  const CategorySelector = () => {
    return (
      <DropdownButton
        title={current?.schema.title || currentKey}
        className="mb-3"
        onSelect={(key) => setPanel(key || "")}
      >
        {categories.map((key) => (
          <Dropdown.Item key={key} eventKey={key}>
            {advancedSettingsSchemas[key]?.schema.title || key}
          </Dropdown.Item>
        ))}
      </DropdownButton>
    );
  };

  const { schema, ui } = patchSchema(current, structure);

  return (
    <div>
      {<CategorySelector />}

      {current && (
        <Form
          schema={schema}
          uiSchema={{
            ...ui,
            "ui:submitButtonOptions": { norender: true },
            "ui:options": { title: "", classNames: `${currentKey}-panel` },
          }}
          widgets={widgets}
          formData={patchDataIn(schema, parameters)}
          onChange={(e) =>
            onFormChange(currentKey, patchDataOut(schema, e.formData))
          }
          validator={validator}
          showErrorList={false}
          liveValidate
        />
      )}
    </div>
  );
};

export default ParameterSettingsStep;
