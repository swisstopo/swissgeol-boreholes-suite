const ErrorTypes = [
  {
    id: 0,
    messageId: "errorMissingBedrock",
    solutions: ["errorMissingBedrockSolution"],
  },
  {
    id: 1,
    messageId: "invertedDepth",
    solutions: [],
  },
  {
    id: 2,
    messageId: "errorOverlap",
    solutions: [
      "errorGapSolution_extendUpperLayer",
      "errorGapSolution_extendLowerLayer",
    ],
  },
  {
    id: 3,
    messageId: "errorGap",
    solutions: [
      "errorGapSolution_fillWithUndefined",
      "errorGapSolution_extendUpperLayer",
      "errorGapSolution_extendLowerLayer",
    ],
  },
  {
    id: 4,
    messageId: "errorStartWrong",
    solutions: [
      "errorGapSolution_fillWithUndefined",
      "errorGapSolution_extendLowerToZero",
    ],
  },
  { id: 5, messageId: "errorWrongDepth", solutions: ["errorWrongDepth"] },
  {
    id: 6,
    messageId: "errorAttention",
    solutions: ["deletelayer", "extendupper", "extendlower"],
  },
];

export default ErrorTypes;
