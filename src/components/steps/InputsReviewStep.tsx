import { useEffect, useRef } from "react";
import { Accordion } from "react-bootstrap";
import { Atoms, WEAS } from "weas";

import { WorkflowInputs } from "@common/interfaces";
import { DEBUG } from "@common/utils";

interface InputsReviewStepProps {
  inputs: WorkflowInputs;
  controls: React.ReactNode;
}

let weasViewer: InstanceType<typeof WEAS> | null = null;

export const InputsReviewStep: React.FC<InputsReviewStepProps> = ({
  inputs,
  controls,
}) => {
  DEBUG && console.log("InputsReviewStep");

  const viewerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewerContainerRef.current) {
      weasViewer = new WEAS({ domElement: viewerContainerRef.current });
      if (inputs.structure) {
        weasViewer.avr.atoms = inputs.structure as Atoms;
        weasViewer.avr.modelStyle = 1;
        weasViewer.render();
      }
    }
  }, []);

  return (
    <div>
      <h2>Step 5: Review workflow inputs</h2>
      {controls}
      <div
        style={{
          marginBottom: "15px",
        }}
      >
        <Accordion>
          <Accordion.Item eventKey="0">
            <Accordion.Header>Structure</Accordion.Header>
            <Accordion.Body
              ref={viewerContainerRef}
              style={{ position: "relative" }}
            ></Accordion.Body>
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
    </div>
  );
};
