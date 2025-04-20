import Form from "@rjsf/react-bootstrap";
import validator from "@rjsf/validator-ajv8";

import { InputSchema } from "../interfaces";

const workflowSchema: InputSchema = {
  schema: {
    type: "object",
    properties: {
      label: { type: "string", title: "Label" },
      description: { type: "string", title: "Description" },
    },
  },
  ui: {
    label: { "ui:placeholder": "e.g. My Workflow" },
    description: {
      "ui:placeholder": "e.g. This workflow does...",
      "ui:widget": "textarea",
    },
  },
};

interface WorkflowSubmissionStepProps {
  metadata: Record<string, string>;
  onChange: (metadata: Record<string, string>) => void;
  controls: React.ReactNode;
}

const WorkflowSubmissionStep: React.FC<WorkflowSubmissionStepProps> = ({
  metadata,
  onChange,
  controls,
}) => {
  return (
    <div>
      <h2>Step 5: Submit the workflow</h2>
      {controls}
      <Form
        schema={workflowSchema.schema}
        uiSchema={{
          ...workflowSchema.ui,
          "ui:submitButtonOptions": { norender: true },
        }}
        formData={metadata}
        onChange={(e) => onChange(e.formData)}
        validator={validator}
      />
    </div>
  );
};

export default WorkflowSubmissionStep;
