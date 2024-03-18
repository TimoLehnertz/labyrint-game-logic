import { Heading } from "./Heading";
import { OpenSides } from "./OpenSides";
import { TileType } from "./PathTile";

test("Streight", () => {
  let openSides = new OpenSides(TileType.STREIGHT, -4);
  expect(openSides.northOpen).toBe(false);
  expect(openSides.eastOpen).toBe(true);
  expect(openSides.southOpen).toBe(false);
  expect(openSides.westOpen).toBe(true);

  openSides = new OpenSides(TileType.STREIGHT, 1);
  expect(openSides.northOpen).toBe(true);
  expect(openSides.eastOpen).toBe(false);
  expect(openSides.southOpen).toBe(true);
  expect(openSides.westOpen).toBe(false);

  openSides = new OpenSides(TileType.STREIGHT, 2);
  expect(openSides.northOpen).toBe(false);
  expect(openSides.eastOpen).toBe(true);
  expect(openSides.southOpen).toBe(false);
  expect(openSides.westOpen).toBe(true);

  openSides = new OpenSides(TileType.STREIGHT, 3);
  expect(openSides.northOpen).toBe(true);
  expect(openSides.eastOpen).toBe(false);
  expect(openSides.southOpen).toBe(true);
  expect(openSides.westOpen).toBe(false);
});

test("L", () => {
  let openSides = new OpenSides(TileType.L, 0);
  expect(openSides.northOpen).toBe(false);
  expect(openSides.eastOpen).toBe(true);
  expect(openSides.southOpen).toBe(true);
  expect(openSides.westOpen).toBe(false);

  openSides = new OpenSides(TileType.L, 1);
  expect(openSides.northOpen).toBe(false);
  expect(openSides.eastOpen).toBe(false);
  expect(openSides.southOpen).toBe(true);
  expect(openSides.westOpen).toBe(true);

  openSides = new OpenSides(TileType.L, 2);
  expect(openSides.northOpen).toBe(true);
  expect(openSides.eastOpen).toBe(false);
  expect(openSides.southOpen).toBe(false);
  expect(openSides.westOpen).toBe(true);

  openSides = new OpenSides(TileType.L, 3);
  expect(openSides.northOpen).toBe(true);
  expect(openSides.eastOpen).toBe(true);
  expect(openSides.southOpen).toBe(false);
  expect(openSides.westOpen).toBe(false);
});

test("T", () => {
  let openSides = new OpenSides(TileType.T, 0);
  expect(openSides.northOpen).toBe(true);
  expect(openSides.eastOpen).toBe(true);
  expect(openSides.southOpen).toBe(false);
  expect(openSides.westOpen).toBe(true);

  openSides = new OpenSides(TileType.T, 1);
  expect(openSides.northOpen).toBe(true);
  expect(openSides.eastOpen).toBe(true);
  expect(openSides.southOpen).toBe(true);
  expect(openSides.westOpen).toBe(false);

  openSides = new OpenSides(TileType.T, 2);
  expect(openSides.northOpen).toBe(false);
  expect(openSides.eastOpen).toBe(true);
  expect(openSides.southOpen).toBe(true);
  expect(openSides.westOpen).toBe(true);

  openSides = new OpenSides(TileType.T, 3);
  expect(openSides.northOpen).toBe(true);
  expect(openSides.eastOpen).toBe(false);
  expect(openSides.southOpen).toBe(true);
  expect(openSides.westOpen).toBe(true);
});

test("getHeadings", () => {
  let headings = new OpenSides(TileType.T, 0).headings;
  expect(headings[1]).toBe(Heading.EAST);
  expect(headings[2]).toBe(Heading.WEST);

  headings = new OpenSides(TileType.T, 1).headings;
  expect(headings[0]).toBe(Heading.NORTH);
  expect(headings[1]).toBe(Heading.EAST);
  expect(headings[2]).toBe(Heading.SOUTH);

  headings = new OpenSides(TileType.T, 2).headings;
  expect(headings[0]).toBe(Heading.EAST);
  expect(headings[1]).toBe(Heading.SOUTH);
  expect(headings[2]).toBe(Heading.WEST);

  headings = new OpenSides(TileType.T, 3).headings;
  expect(headings[0]).toBe(Heading.NORTH);
  expect(headings[1]).toBe(Heading.SOUTH);
  expect(headings[2]).toBe(Heading.WEST);
});

test("getHeadingsCache", () => {
  const openSides = new OpenSides(TileType.T, 0);
  expect(openSides.headings === openSides.headings).toBe(true);
});
