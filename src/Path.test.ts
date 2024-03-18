import { BoardPosition } from "./BoardPosition";
import { Path } from "./Path";

test("length", () => {
  const path = new Path([new BoardPosition(1, 1)]);
  expect(path.length).toBe(1);
});

test("getPositionInPath", () => {
  const position = new BoardPosition(1, 1);
  const path = new Path([position]);
  expect(path.getPositionInPath(0)).toBe(position);
});
