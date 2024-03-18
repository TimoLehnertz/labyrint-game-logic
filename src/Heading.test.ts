import { Heading, HeadingHelper } from "./Heading";
import { Vec2 } from "./Vec2";

test("vec2", () => {
  const north = Heading.NORTH;
  const northVec2 = new HeadingHelper(north).vec2;
  expect(northVec2.equals(new Vec2(0, -1))).toBe(true);

  const east = Heading.EAST;
  const eastVec2 = new HeadingHelper(east).vec2;
  expect(eastVec2.equals(new Vec2(1, 0))).toBe(true);

  const south = Heading.SOUTH;
  const southVec2 = new HeadingHelper(south).vec2;
  expect(southVec2.equals(new Vec2(0, 1))).toBe(true);

  const west = Heading.WEST;
  const westVec2 = new HeadingHelper(west).vec2;
  expect(westVec2.equals(new Vec2(-1, 0))).toBe(true);
});
