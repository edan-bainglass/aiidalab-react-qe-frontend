import Form from "@rjsf/react-bootstrap";
import validator from "@rjsf/validator-ajv8";
import { Button } from "react-bootstrap";

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

interface WorkflowSubmissionProps {
  onConfirm: () => void;
  onBack: () => void;
}

const WorkflowSubmission: React.FC<WorkflowSubmissionProps> = ({
  onConfirm,
  onBack,
}) => {
  return (
    <div>
      <h2>Step 5: Submit the workflow</h2>
      <Form
        schema={workflowSchema.schema}
        uiSchema={{
          ...workflowSchema.ui,
          "ui:submitButtonOptions": { norender: true },
        }}
        validator={validator}
      />
      <div className="input-panel-controls">
        <Button
          variant="secondary"
          onClick={onBack}
          style={{ marginRight: "10px" }}
        >
          Back
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Submit Workflow
        </Button>
      </div>
    </div>
  );
};

export default WorkflowSubmission;
