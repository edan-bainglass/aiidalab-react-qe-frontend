import React, { useReducer, useEffect, useState } from "react";
import { Breadcrumb, Col, Container, Row } from "react-bootstrap";

import StructureSelection from "./components/StructureSelection";
import PropertySelection from "./components/PropertySelection";
import ParametersConfiguration from "./components/ParametersConfiguration";
import ResourcesSelection from "./components/ResourcesSelection";
import WorkflowSubmission from "./components/WorkflowSubmission";
import WorkflowResults from "./components/WorkflowResults";

import { WizardState, WizardAction, Property } from "./interfaces";

const steps = [
  { id: 1, label: "Structure" },
  { id: 2, label: "Properties" },
  { id: 3, label: "Parameters" },
  { id: 4, label: "Resources" },
  { id: 5, label: "Submit" },
  { id: 6, label: "Results" },
];

const initialState: WizardState = {
  structure: null,
  availableProperties: [],
  selectedProperties: [],
  parameters: {},
  resources: null,
  results: null,
};

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_AVAILABLE_PROPERTIES":
      return { ...state, availableProperties: action.payload };
    case "SET_STRUCTURE":
      return { ...state, structure: action.payload };
    case "SET_SELECTED_PROPERTIES":
      return { ...state, selectedProperties: action.payload };
    case "SET_PARAMETERS":
      return {
        ...state,
        parameters: {
          ...state.parameters,
          [action.payload.panelKey]: action.payload.data,
        },
      };
    case "SET_RESOURCES":
      return { ...state, resources: action.payload };
    case "SET_RESULTS":
      return { ...state, results: action.payload };
    case "LOAD_WORKFLOW":
      return { ...action.payload };
    default:
      return state;
  }
}

const Wizard: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const handleSubmission = async () => {
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          structure: state.structure,
          properties: state.selectedProperties,
          parameters: state.parameters,
          resources: state.resources,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit workflow");
      const data = await res.json();
      dispatch({ type: "SET_RESULTS", payload: data });
      setCurrentStep(6); // Move to results step
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch available plugin properties once
  useEffect(() => {
    async function loadProperties() {
      try {
        const res = await fetch("/api/plugins");
        if (!res.ok) throw new Error("Failed to load plugins");
        const data: Property[] = await res.json();
        dispatch({ type: "SET_AVAILABLE_PROPERTIES", payload: data });
      } catch (err) {
        console.error(err);
      }
    }
    loadProperties();
  }, []);

  const goNext = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));

  const goPrev = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StructureSelection
            structure={state.structure}
            onChange={(s) => dispatch({ type: "SET_STRUCTURE", payload: s })}
            onConfirm={goNext}
          />
        );
      case 2:
        return (
          <PropertySelection
            available={state.availableProperties}
            selected={state.selectedProperties}
            onChange={(sel) =>
              dispatch({ type: "SET_SELECTED_PROPERTIES", payload: sel })
            }
            onConfirm={goNext}
            onBack={goPrev}
          />
        );
      case 3:
        return (
          <ParametersConfiguration
            selectedProperties={state.selectedProperties}
            parameters={state.parameters}
            onChange={(panelKey, data) =>
              dispatch({ type: "SET_PARAMETERS", payload: { panelKey, data } })
            }
            onConfirm={goNext}
            onBack={goPrev}
          />
        );
      case 4:
        return (
          <ResourcesSelection
            resources={state.resources}
            onChange={(r) => dispatch({ type: "SET_RESOURCES", payload: r })}
            onConfirm={goNext}
            onBack={goPrev}
          />
        );
      case 5:
        return (
          <WorkflowSubmission
            inputs={{
              structure: state.structure,
              properties: state.selectedProperties,
              parameters: state.parameters,
              resources: state.resources,
            }}
            onConfirm={handleSubmission}
            onBack={goPrev}
          />
        );
      case 6:
        return <WorkflowResults results={state.results} onBack={goPrev} />;
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
        <Col>{renderStep()}</Col>
      </Row>
    </Container>
  );
};

export default Wizard;
