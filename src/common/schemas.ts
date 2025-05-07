import { ParameterSchemas } from "./interfaces";

export const parameterSchemas: ParameterSchemas = {
  basic: {
    dependencies: {
      relax: ["structure.pbc"],
    },
    schema: {
      properties: {
        relax: {
          $ref: "#/definitions/relax",
        },
        electronic_type: {
          $ref: "#/definitions/electronic_type",
        },
        protocol: {
          $ref: "#/definitions/protocol",
        },
        magnetism: {
          $ref: "#/definitions/magnetism",
        },
        spin_orbit: {
          $ref: "#/definitions/spin_orbit",
        },
      },
      title: "",
      type: "object",
      definitions: {
        relax: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
          default: null,
          title: "Relaxation level",
        },
        electronic_type: {
          default: "metallic",
          enum: ["metallic", "insulator"],
          title: "Electronic type",
          type: "string",
        },
        protocol: {
          default: "fast",
          enum: ["fast", "balanced", "stringent"],
          title: "Protocol",
          type: "string",
        },
        magnetism: {
          default: false,
          title: "Magnetism",
          type: "boolean",
        },
        spin_orbit: {
          default: false,
          title: "Spin-orbit coupling",
          type: "boolean",
        },
      },
      if: {
        properties: {
          "structure.pbc": {
            const: [false, false, false],
          },
        },
      },
      then: {
        properties: {
          relax: {
            enum: ["none", "positions"],
            default: "positions",
          },
        },
      },
      else: {
        properties: {
          relax: {
            enum: ["none", "positions", "positions-cell"],
            default: "positions-cell",
          },
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
        "ui:enumNames": ["Metallic", "Insulator"],
      },
      protocol: {
        "ui:widget": "toggleGroup",
        "ui:enumNames": ["Fast", "Balanced", "Stringent"],
      },
    },
  },
  advanced: {
    convergence: {
      dependencies: {
        scfConvEng: ["basic.protocol"],
        ionicConvEng: ["basic.protocol"],
        ionicConvForce: ["basic.protocol"],
      },
      schema: {
        properties: {
          scfConvEng: {
            $ref: "#/definitions/scfConvEng",
          },
          ionicConvEng: {
            $ref: "#/definitions/ionicConvEng",
          },
          ionicConvForce: {
            $ref: "#/definitions/ionicConvForce",
          },
        },
        required: ["scfConvEng", "ionicConvEng", "ionicConvForce"],
        title: "Convergence",
        type: "object",
        definitions: {
          scfConvEng: {
            title: "SCF energy (Ry/atom)",
            type: "number",
          },
          ionicConvEng: {
            title: "Ionic energy (Ry/atom)",
            type: "number",
          },
          ionicConvForce: {
            title: "Ionic force (Ry/Bohr)",
            type: "number",
          },
        },
        if: {
          properties: {
            "basic.protocol": {
              const: "fast",
            },
          },
        },
        then: {
          properties: {
            scfConvEng: {
              default: 4e-10,
            },
            ionicConvEng: {
              default: 0.0001,
            },
            ionicConvForce: {
              default: 0.001,
            },
          },
        },
        else: {
          if: {
            properties: {
              "basic.protocol": {
                const: "balanced",
              },
            },
          },
          then: {
            properties: {
              scfConvEng: {
                default: 2e-10,
              },
              ionicConvEng: {
                default: 1e-5,
              },
              ionicConvForce: {
                default: 0.0001,
              },
            },
          },
          else: {
            properties: {
              scfConvEng: {
                default: 1e-10,
              },
              ionicConvEng: {
                default: 5e-6,
              },
              ionicConvForce: {
                default: 5e-5,
              },
            },
          },
        },
      },
    },
    smearing: {
      schema: {
        properties: {
          method: {
            $ref: "#/definitions/method",
          },
          width: {
            $ref: "#/definitions/width",
          },
        },
        title: "Smearing",
        type: "object",
        definitions: {
          method: {
            default: "gaussian",
            enum: ["gaussian", "methfessel-paxton", "fermi-dirac"],
            title: "Method",
            type: "string",
          },
          width: {
            default: 0.05,
            title: "Width (Ry)",
            type: "number",
          },
        },
      },
      ui: {
        method: {
          "ui:enumNames": ["Gaussian", "Methfessel-Paxton", "Fermi-Dirac"],
        },
      },
    },
    magnetization: {
      requires: {
        "basic.magnetism": {
          const: true,
        },
      },
      dependencies: {
        mode: ["basic.electronic_type"],
        tot_magnetization: ["basic.electronic_type"],
        moments: ["structure.species", "basic.electronic_type"],
      },
      schema: {
        required: ["moments"],
        title: "Magnetization",
        type: "object",
        definitions: {
          mode: {
            default: "moments",
            enum: ["moments", "total"],
            title: "Input mode",
            type: "string",
          },
          tot_magnetization: {
            default: 1,
            minimum: 0.0,
            multipleOf: 0.1,
            title: "Total magnetization",
            type: "number",
          },
          moments: {
            items: {
              type: "number",
              default: 0.1,
            },
            title: "Initial magnetic moments",
            type: "array",
          },
        },
        if: {
          properties: {
            "basic.electronic_type": {
              const: "insulator",
            },
          },
        },
        then: {
          properties: {
            tot_magnetization: {
              $ref: "#/definitions/tot_magnetization",
            },
          },
        },
        else: {
          properties: {
            mode: {
              $ref: "#/definitions/mode",
            },
          },
          if: {
            properties: {
              mode: {
                const: "moments",
              },
            },
          },
          then: {
            properties: {
              moments: {
                $ref: "#/definitions/moments",
              },
            },
          },
          else: {
            properties: {
              tot_magnetization: {
                $ref: "#/definitions/tot_magnetization",
              },
            },
          },
        },
      },
      ui: {
        mode: {
          "ui:widget": "toggleGroup",
          "ui:enumNames": ["Initial magnetic moments", "Total magnetization"],
        },
        moments: {
          "ui:options": {
            classNames: "mt-2",
          },
          items: {
            generatedFrom: "structure.species",
            template: "{{species}}",
          },
        },
      },
    },
    hubbard: {
      schema: {
        properties: {
          use_hubbard: {
            $ref: "#/definitions/use_hubbard",
          },
        },
        title: "Hubbard U",
        type: "object",
        definitions: {
          use_hubbard: {
            default: false,
            title: "Enable U",
            type: "boolean",
          },
          U: {
            default: 0.0,
            minimum: 0.0,
            title: "U (eV)",
            type: "number",
          },
        },
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
              $ref: "#/definitions/U",
            },
          },
        },
      },
    },
    pseudos: {
      dependencies: {
        family: ["basic.spin_orbit"],
        accuracy: ["basic.protocol"],
        pseudopotentials: ["structure.species"],
      },
      dynamic: {
        accuracy: [
          {
            endpoint: "/api/core/schema/dynamic/accuracy/labels",
            requires: ["pseudos.family"],
            target: "ui",
            path: "ui:enumNames",
          },
        ],
      },
      schema: {
        properties: {
          functional: {
            $ref: "#/definitions/functional",
          },
          family: {
            $ref: "#/definitions/family",
          },
          accuracy: {
            $ref: "#/definitions/accuracy",
          },
          pseudopotentials: {
            $ref: "#/definitions/pseudopotentials",
          },
        },
        required: ["pseudopotentials"],
        title: "Pseudopotentials",
        type: "object",
        definitions: {
          functional: {
            default: "pbe_sol",
            enum: ["pbe", "pbe_sol"],
            title: "Functional",
            type: "string",
          },
          family: {
            anyOf: [
              {
                type: "string",
              },
              {
                type: "null",
              },
            ],
            default: null,
            title: "Family",
          },
          accuracy: {
            anyOf: [
              {
                type: "string",
              },
              {
                type: "null",
              },
            ],
            default: null,
            title: "Accuracy",
          },
          pseudopotentials: {
            items: {
              type: "string",
              format: "data-url",
            },
            title: "Pseudopotentials",
            type: "array",
          },
        },
        if: {
          properties: {
            "basic.spin_orbit": {
              const: false,
            },
          },
        },
        then: {
          properties: {
            family: {
              enum: ["PseudoDojo", "SSSP"],
              default: "SSSP",
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
                enum: ["efficiency", "precision"],
                default: "efficiency",
              },
            },
          },
          else: {
            properties: {
              accuracy: {
                enum: ["standard", "stringent"],
                default: "standard",
              },
            },
          },
        },
        else: {
          properties: {
            family: {
              enum: ["PseudoDojo"],
              default: "PseudoDojo",
            },
            accuracy: {
              enum: ["standard", "stringent"],
              default: "standard",
            },
          },
        },
      },
      ui: {
        functional: {
          "ui:widget": "toggleGroup",
          "ui:enumNames": ["PBE", "PBEsol"],
        },
        family: {
          "ui:widget": "toggleGroup",
          "ui:enumNames": ["PseudoDojo", "SSSP"],
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
            generatedFrom: "structure.species",
            template: "{{species}}",
          },
        },
      },
    },
  },
  plugins: {},
};
