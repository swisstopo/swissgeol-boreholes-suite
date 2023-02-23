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
    solutions: ["errorGapSolution2", "errorGapSolution4"],
  },
  {
    id: 3,
    messageId: "errorGap",
    solutions: ["errorGapSolution1", "errorGapSolution2", "errorGapSolution4"],
  },
  {
    id: 4,
    messageId: "errorStartWrong",
    solutions: ["errorGapSolution1", "errorGapSolution3"],
  },
  { id: 5, messageId: "errorWrongDepth", solutions: ["errorWrongDepth"] },
  {
    id: 6,
    messageId: "errorAttention",
    solutions: ["deletelayer", "extendupper", "extendlower"],
  },
];

export default ErrorTypes;
