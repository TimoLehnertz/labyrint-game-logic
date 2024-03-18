import { PathTile, TileType } from "./PathTile";
import { Treasure } from "./Treasure";

test("openSides", () => {
  const pathTile = new PathTile(TileType.L, null, -4, null);
  let openSides = pathTile.openSides;
  expect(openSides.northOpen).toBe(false);
  expect(openSides.eastOpen).toBe(true);
  expect(openSides.southOpen).toBe(true);
  expect(openSides.westOpen).toBe(false);
  openSides = pathTile.openSides; // cached
  expect(openSides.northOpen).toBe(false);
  expect(openSides.eastOpen).toBe(true);
  expect(openSides.southOpen).toBe(true);
  expect(openSides.westOpen).toBe(false);
});

test("rotate", () => {
  let pathTile = new PathTile(TileType.L, null, -4, null);
  pathTile = pathTile.rotate(5);
  expect(pathTile.rotation).toBe(1);

  pathTile = new PathTile(TileType.L, null, -4, null);
  pathTile = pathTile.rotate(0);
  expect(pathTile.rotation).toBe(0);
});

test("setHomeOfPlayerIndex", () => {
  let pathTile = new PathTile(TileType.L, null, 5, null);
  expect(pathTile.homeOfPlayerIndex).toBe(null);
  pathTile = pathTile.setHomeOfPlayerIndex(3);
  expect(pathTile.homeOfPlayerIndex).toBe(3);
});

test("setTreasure", () => {
  let pathTile = new PathTile(TileType.L, null, -4, null);
  expect(pathTile.treasure).toBe(null);
  pathTile = pathTile.setTreasure(new Treasure(1));
  expect(pathTile.treasure?.equals(new Treasure(1))).toBe(true);
});

test("equals", () => {
  const a = new PathTile(TileType.L, new Treasure(1), 3, null);
  const b = new PathTile(TileType.L, new Treasure(1), 3, null);
  const c = new PathTile(TileType.T, null, -4, null);
  const d = new PathTile(TileType.T, new Treasure(1), -3, null);
  const e = new PathTile(TileType.T, new Treasure(1), 0, null);
  const f = new PathTile(TileType.T, new Treasure(1), 0, 1);
  expect(a.equals(b)).toBe(true);
  expect(b.equals(c)).toBe(false);
  expect(c.equals(d)).toBe(false);
  expect(c.equals(d)).toBe(false);
  expect(d.equals(e)).toBe(false);
  expect(e.equals(f)).toBe(false);
});
