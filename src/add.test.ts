import { add } from "./add";

test("basic", () => {
  expect(add(0, 0)).toBe(0);
});

test("basic again", () => {
  expect(add(1, 2)).toBe(3);
});
