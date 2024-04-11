import { BoardPosition } from "./BoardPosition";
import { Heading } from "./Heading";
import { Path } from "./Path";

test("length", () => {
  const path = new Path([
    {
      from: new BoardPosition(1, 1),
      to: new BoardPosition(1, 2),
      heading: Heading.NORTH,
    },
  ]);
  expect(path.length).toBe(1);
});

test("getPart", () => {
  const part = {
    from: new BoardPosition(1, 1),
    to: new BoardPosition(1, 2),
    heading: Heading.NORTH,
  };
  const path = new Path([part]);
  expect(path.getPart(0)).toBe(part);
});
