import { useEffect, useRef } from "react";
import { Accordion, Button } from "react-bootstrap";
import { WEAS } from "weas";

import { WorkflowInputs } from "../interfaces";

interface ParametersReviewProps {
  inputs: WorkflowInputs;
  onConfirm: () => void;
  onBack: () => void;
}

let weasViewer: InstanceType<typeof WEAS> | null = null;

const ParametersReview: React.FC<ParametersReviewProps> = ({
  inputs,
  onConfirm,
  onBack,
}) => {
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!weasViewer && viewerContainerRef.current) {
      weasViewer = new WEAS({ domElement: viewerContainerRef.current });
      if (inputs.structure) {
        weasViewer.avr.atoms = inputs.structure;
        weasViewer.avr.modelStyle = 1;
        weasViewer.render();
      }
    }
  }, []);

  return (
    <div>
      <h2>Step 5: Review workflow parameters</h2>
      <div
        style={{
          marginBottom: "15px",
        }}
      >
        <Accordion>
          <Accordion.Item eventKey="0">
            <Accordion.Header>Structure</Accordion.Header>
            <Accordion.Body ref={viewerContainerRef}></Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header>Properties</Accordion.Header>
            <Accordion.Body>
              <pre>{JSON.stringify(inputs.properties, null, 2)}</pre>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2">
            <Accordion.Header>Parameters</Accordion.Header>
            <Accordion.Body>
              <pre>{JSON.stringify(inputs.parameters, null, 2)}</pre>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="3">
            <Accordion.Header>Resources</Accordion.Header>
            <Accordion.Body>
              <pre>{JSON.stringify(inputs.resources, null, 2)}</pre>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
      <p>
        <b>Note:</b> You can go back to edit any of the previous steps if
        needed.
      </p>
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

export default ParametersReview;
