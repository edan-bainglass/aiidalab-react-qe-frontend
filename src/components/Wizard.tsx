import React, { useReducer, useState } from "react";
import { Breadcrumb, Button, Col, Container, Row } from "react-bootstrap";

import { WizardAction, WizardState } from "@interfaces";
import { parameterSchemas } from "@schemas";
import {
  InputsReviewStep,
  ParameterSettingsStep,
  PropertySelectionStep,
  ResourceSelectionStep,
  StructureSelectionStep,
  WorkflowResultsStep,
  WorkflowSubmissionStep,
} from "@steps";

const steps = [
  { id: 1, label: "Structure" },
  { id: 2, label: "Properties" },
  { id: 3, label: "Parameters" },
  { id: 4, label: "Resources" },
  { id: 5, label: "Review" },
  { id: 6, label: "Submit" },
  { id: 7, label: "Results" },
];

const initialState: WizardState = {
  structure: null,
  properties: {},
  activeParametersPanel: "basic",
  activeAdvancedPanel: "convergence",
  activePluginPanel: "",
  parameterSchemas: parameterSchemas,
  parameters: {},
  resources: null,
  metadata: {},
  results: null,
};

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_STRUCTURE":
      return { ...state, structure: action.payload };
    case "SET_PROPERTIES":
      return { ...state, properties: action.payload };
    case "SET_PARAMETERS_PANEL":
      return { ...state, activeParametersPanel: action.payload };
    case "SET_ADVANCED_PANEL":
      return { ...state, activeAdvancedPanel: action.payload };
    case "SET_PLUGIN_PANEL":
      return { ...state, activePluginPanel: action.payload };
    case "UPDATE_PLUGIN_SCHEMAS":
      return {
        ...state,
        parameterSchemas: {
          ...state.parameterSchemas,
          plugins: {
            ...state.parameterSchemas.plugins,
            ...action.payload,
          },
        },
      };
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
    case "SET_METADATA":
      return { ...state, metadata: { ...state.metadata, ...action.payload } };
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
          properties: Object.keys(state.properties).filter(
            (key) => state.properties[key].active
          ),
          parameters: state.parameters,
          resources: state.resources,
          metadata: state.metadata,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit workflow");
      const data = await res.json();
      dispatch({ type: "SET_RESULTS", payload: data });
      setCurrentStep(7); // Move to results step
    } catch (err) {
      console.error(err);
    }
  };

  const goNext = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));

  const goPrev = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StructureSelectionStep
            structure={state.structure}
            onChange={(s) => dispatch({ type: "SET_STRUCTURE", payload: s })}
            controls={<StepNavControls next={goNext} />}
          />
        );
      case 2:
        return (
          <PropertySelectionStep
            properties={state.properties}
            onChange={(selected) =>
              dispatch({ type: "SET_PROPERTIES", payload: selected })
            }
            controls={<StepNavControls prev={goPrev} next={goNext} />}
          />
        );
      case 3:
        return (
          <ParameterSettingsStep
            structure={state.structure}
            properties={state.properties}
            parametersSchema={state.parameterSchemas}
            parameters={state.parameters}
            onChange={(panelKey, data) =>
              dispatch({ type: "SET_PARAMETERS", payload: { panelKey, data } })
            }
            controls={<StepNavControls prev={goPrev} next={goNext} />}
            panel={state.activeParametersPanel}
            onPanelChange={(panel) =>
              dispatch({
                type: "SET_PARAMETERS_PANEL",
                payload: panel,
              })
            }
            advancedPanel={state.activeAdvancedPanel}
            onAdvancedPanelChange={(panel) =>
              dispatch({ type: "SET_ADVANCED_PANEL", payload: panel })
            }
            pluginPanel={state.activePluginPanel}
            onPluginPanelChange={(panel) =>
              dispatch({ type: "SET_PLUGIN_PANEL", payload: panel })
            }
            onPluginSchemasChange={(schema) =>
              dispatch({
                type: "UPDATE_PLUGIN_SCHEMAS",
                payload: schema,
              })
            }
          />
        );
      case 4:
        return (
          <ResourceSelectionStep
            resources={state.resources}
            onChange={(r) => dispatch({ type: "SET_RESOURCES", payload: r })}
            controls={<StepNavControls prev={goPrev} next={goNext} />}
          />
        );
      case 5:
        return (
          <InputsReviewStep
            inputs={{
              structure: state.structure,
              properties: Object.keys(state.properties).filter(
                (key) => state.properties[key].active
              ),
              parameters: state.parameters,
              resources: state.resources,
            }}
            controls={
              <StepNavControls
                prev={goPrev}
                next={goNext}
                nextLabel={"Confirm"}
              />
            }
          />
        );
      case 6:
        return (
          <WorkflowSubmissionStep
            metadata={state.metadata}
            onChange={(m) => dispatch({ type: "SET_METADATA", payload: m })}
            controls={
              <StepNavControls
                prev={goPrev}
                next={handleSubmission}
                nextLabel={"Submit"}
              />
            }
          />
        );
      case 7:
        return (
          <WorkflowResultsStep
            results={state.results}
            controls={<StepNavControls prev={goPrev} />}
          />
        );
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

interface StepNavControlsProps {
  prev?: () => void;
  next?: () => void;
  backLabel?: string;
  nextLabel?: string;
}

const StepNavControls: React.FC<StepNavControlsProps> = ({
  prev,
  next,
  backLabel = "Back",
  nextLabel = "Next",
}) => (
  <Row className="my-2">
    <Col>
      {prev && (
        <Button variant="secondary" onClick={prev} className="me-2">
          {backLabel}
        </Button>
      )}
      {next && (
        <Button variant="primary" onClick={next}>
          {nextLabel}
        </Button>
      )}
    </Col>
  </Row>
);
