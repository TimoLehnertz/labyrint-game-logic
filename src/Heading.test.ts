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

test("getAllHeadings", () => {
  const all = HeadingHelper.getAllHeadings();
  expect(all[0]).toBe(Heading.NORTH);
  expect(all[1]).toBe(Heading.EAST);
  expect(all[2]).toBe(Heading.SOUTH);
  expect(all[3]).toBe(Heading.WEST);
});

test("inverted", () => {
  expect(new HeadingHelper(Heading.NORTH).inverted).toBe(Heading.SOUTH);
  expect(new HeadingHelper(Heading.EAST).inverted).toBe(Heading.WEST);
  expect(new HeadingHelper(Heading.SOUTH).inverted).toBe(Heading.NORTH);
  expect(new HeadingHelper(Heading.WEST).inverted).toBe(Heading.EAST);
});
