import { SchemaMap } from "./interfaces";

export const parametersSchema: SchemaMap = {
  basic: {
    active: true,
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
  },
  convergence: {
    active: true,
    schema: {
      type: "object",
      title: "Convergence",
      dependsOn: ["basic.protocol"],
      oneOf: [
        {
          type: "object",
          properties: {
            protocol: {
              const: "Fast",
            },
            scfConvEng: {
              type: "number",
              title: "SCF energy (Ry/atom)",
              default: 4e-10,
            },
            ionicConvEng: {
              type: "number",
              title: "Ionic energy (Ry/atom)",
              default: 0.0001,
            },
            ionicConvForce: {
              type: "number",
              title: "Ionic force (Ry/Bohr)",
              default: 0.001,
            },
          },
        },
        {
          type: "object",
          properties: {
            protocol: {
              const: "Balanced",
            },
            scfConvEng: {
              type: "number",
              title: "SCF energy (Ry/atom)",
              default: 2e-10,
            },
            ionicConvEng: {
              type: "number",
              title: "Ionic energy (Ry/atom)",
              default: 0.00001,
            },
            ionicConvForce: {
              type: "number",
              title: "Ionic force (Ry/Bohr)",
              default: 0.0001,
            },
          },
        },
        {
          type: "object",
          properties: {
            protocol: {
              const: "Stringent",
            },
            scfConvEng: {
              type: "number",
              title: "SCF energy (Ry/atom)",
              default: 1e-10,
            },
            ionicConvEng: {
              type: "number",
              title: "Ionic energy (Ry/atom)",
              default: 0.000005,
            },
            ionicConvForce: {
              type: "number",
              title: "Ionic force (Ry/Bohr)",
              default: 0.00005,
            },
          },
        },
      ],
    },
    ui: {
      protocol: {
        "ui:widget": "hidden",
      },
    },
  },
  smearing: {
    active: true,
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
    active: true,
    schema: {
      type: "object",
      title: "Magnetization",
      properties: {
        initialMagnetization: {
          type: "number",
          title: "Initial magnetization",
        },
      },
    },
  },
  hubbardU: {
    active: true,
    schema: {
      type: "object",
      title: "Hubbard U",
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
            type: "number",
            title: "U (eV)",
            minimum: 0,
            default: 0,
          },
        },
      },
    },
  },
  pseudopotentials: {
    active: true,
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
        pseudopotentials: {
          type: "array",
          title: "Pseudopotentials",
          items: {
            type: "string",
            format: "data-url",
            generatedFrom: "structure.species",
            template: "{{species}}",
          } as any,
        },
      },
      if: {
        properties: {
          family: {
            const: "SSSP",
          },
        },
      },
      then: {
        properties: {
          accuracy: {
            type: "string",
            title: "Accuracy",
            enum: ["Efficiency", "Precision"],
            default: "Efficiency",
          },
        },
      },
      else: {
        if: {
          properties: {
            family: {
              const: "PseudoDojo",
            },
          },
        },
        then: {
          properties: {
            accuracy: {
              type: "string",
              title: "Accuracy",
              enum: ["Standard", "Stringent"],
              default: "Standard",
            },
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
      accuracy: {
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
      "ui:order": ["functional", "family", "accuracy", "pseudopotentials"],
    },
  },
};
