export default {
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  // testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  testRegex: "Game\\.test\\.ts$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
