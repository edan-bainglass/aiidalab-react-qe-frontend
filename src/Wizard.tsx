import { useState } from "react";
import { Breadcrumb, Col, Container, Row } from "react-bootstrap";

import StructureSelection from "./components/StructureSelection";
import {
  default as PropertySelection,
  Property,
} from "./components/PropertySelection";
import ParametersConfiguration from "./components/ParametersConfiguration";
import ResourcesSelection from "./components/ResourcesSelection";
import WorkflowSubmission from "./components/WorkflowSubmission";
import WorkflowResults from "./components/WorkflowResults";

const Wizard = () => {
  const steps = [
    { id: 1, label: "Structure" },
    { id: 2, label: "Properties" },
    { id: 3, label: "Parameters" },
    { id: 4, label: "Resources" },
    { id: 5, label: "Submit" },
    { id: 6, label: "Results" },
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);
  const [parameters, setParameters] = useState<any>({});

  const goNext = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const goPrev = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <StructureSelection onConfirm={goNext} />;
      case 2:
        return (
          <PropertySelection
            onConfirm={(selected: Property[]) => {
              setSelectedProperties(selected);
              goNext();
            }}
            onBack={goPrev}
          />
        );
      case 3:
        return (
          <ParametersConfiguration
            selectedProperties={selectedProperties}
            parameters={parameters}
            setParameters={setParameters}
            onConfirm={goNext}
            onBack={goPrev}
          />
        );
      case 4:
        return <ResourcesSelection onConfirm={goNext} onBack={goPrev} />;
      case 5:
        return <WorkflowSubmission onConfirm={goNext} onBack={goPrev} />;
      case 6:
        return <WorkflowResults onBack={goPrev} />;
      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <Container>
      <Row>
        <Col>
          <Breadcrumb>
            {steps.map((step) => (
              <Breadcrumb.Item
                key={step.id}
                active={step.id === currentStep}
                onClick={() => setCurrentStep(step.id)}
              >
                {step.label}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </Col>
      </Row>
      <Row>
        <Col>{renderStepContent()}</Col>
      </Row>
    </Container>
  );
};

export default Wizard;
