import { Board } from "./Board";
import { BoardPosition } from "./BoardPosition";
import { Game } from "./Game";
import { Heading } from "./Heading";
import { PathTile, TileType } from "./PathTile";
import { ShiftPosition } from "./ShiftPosition";
import { printBoard, printDistances } from "./Utils";

test("invalid array shape", () => {
  const tiles = [[], [new PathTile(TileType.L, null, 0, null)]];
  try {
    const board = new Board(
      tiles,
      new PathTile(TileType.L, null, 0, null),
      new ShiftPosition(Heading.NORTH, 0)
    );
    fail("expected exception");
  } catch (e) {
    expect(e.message).toBe("Tiles of have invalid shape");
  }
});

test("invalid shape", () => {
  const tiles = [[], []];
  try {
    const board = new Board(
      tiles,
      new PathTile(TileType.L, null, 0, null),
      new ShiftPosition(Heading.NORTH, 0)
    );
    fail("expected exception");
  } catch (e) {
    expect(e.message).toBe(
      "The provided size is invalid! Size must be >= 7 and cant be prime"
    );
  }
});

test("generateDistances", () => {
  const board = Game.buildFromSetup({ seed: "seed" }).gameState.board;
  const distances = board.generateDistances(new BoardPosition(0, 0));
  expect(distances[0][0]).toBe(0);
  expect(distances[1][0]).toBe(1);
  expect(distances[2][0]).toBe(2);
  expect(distances[3][0]).toBe(3);
  expect(distances[4][0]).toBe(6);

  expect(distances[0][3]).toBe(Number.MAX_SAFE_INTEGER);
});

test("generateShortestPath", () => {
  const board = Game.buildFromSetup({ seed: "seed" }).gameState.board;
  let path = board.generateShortestPath(
    new BoardPosition(1, 5),
    new BoardPosition(1, 5)
  );
  expect(path?.length).toBe(0);
  // no path
  path = board.generateShortestPath(
    new BoardPosition(0, 0),
    new BoardPosition(1, 5)
  );
  expect(path).toBeNull();

  path = board.generateShortestPath(
    new BoardPosition(0, 3),
    new BoardPosition(1, 3)
  );
  expect(path?.length).toBe(1);

  path = board.generateShortestPath(
    new BoardPosition(0, 0),
    new BoardPosition(1, 0)
  );
  if (path === null) {
    fail("there is a path");
    return;
  }
  expect(path.length).toBe(1);
  expect(path.getPart(0).from.equals(new BoardPosition(0, 0))).toBeTruthy();
  expect(path.getPart(0).to.equals(new BoardPosition(1, 0))).toBeTruthy();
  expect(path.getPart(0).heading).toBe(Heading.EAST);

  path = board.generateShortestPath(
    new BoardPosition(0, 0),
    new BoardPosition(3, 0)
  );
  if (path === null) {
    fail("there is a path");
    return;
  }
  for (let x = 1; x < 4; x++) {
    const pos = path.getPart(x - 1).to;
    expect(pos.equals(new BoardPosition(x, 0))).toBeTruthy();
  }

  path = board.generateShortestPath(
    new BoardPosition(1, 5),
    new BoardPosition(3, 4)
  );
  expect(path?.length).toBe(11);
});

test("isReachable", () => {
  const board = Game.buildFromSetup({ seed: "seed" }).gameState.board;
  let isReachable = board.isReachable(
    new BoardPosition(0, 0),
    new BoardPosition(6, 6)
  );
  expect(isReachable).toBeFalsy();

  isReachable = board.isReachable(
    new BoardPosition(0, 0),
    new BoardPosition(0, 0)
  );
  expect(isReachable).toBeTruthy();
});

test("getReachablePositions", () => {
  const board = Game.buildFromSetup({ seed: "seed" }).gameState.board;
  let reachable = board.getReachablePositions(new BoardPosition(6, 0));
  expect(reachable.length).toBe(4);
  expect(reachable[0].equals(new BoardPosition(6, 0))).toBeTruthy();
  expect(reachable[1].equals(new BoardPosition(6, 1))).toBeTruthy();
  expect(reachable[2].equals(new BoardPosition(5, 1))).toBeTruthy();
  expect(reachable[3].equals(new BoardPosition(5, 0))).toBeTruthy();

  reachable = board.getReachablePositions(new BoardPosition(6, 6));
  expect(reachable.length).toBe(1);
  expect(reachable[0].equals(new BoardPosition(6, 6))).toBeTruthy();

  reachable = board.getReachablePositions(new BoardPosition(0, 5));
  expect(reachable.length).toBe(4);
  expect(reachable[0].equals(new BoardPosition(0, 5))).toBeTruthy();
  expect(reachable[1].equals(new BoardPosition(0, 4))).toBeTruthy();
  expect(reachable[2].equals(new BoardPosition(1, 4))).toBeTruthy();
  expect(reachable[3].equals(new BoardPosition(2, 4))).toBeTruthy();
});

test("getFirstMovedTilePosition and getLastMovedTilePosition", () => {
  const game = Game.buildFromSetup({
    playerCount: 2,
    seed: "Hello world",
  });
  let board = game.gameState.board;
  for (let i = 0; i < 3; i++) {
    const shiftPosition = new ShiftPosition(Heading.NORTH, i);
    expect(
      board
        .getFirstMovedTilePosition(shiftPosition)
        .equals(new BoardPosition(1 + i * 2, 0))
    ).toBe(true);
    expect(
      board
        .getLastMovedTilePosition(shiftPosition)
        .equals(new BoardPosition(1 + i * 2, 6))
    ).toBe(true);
  }
  for (let i = 0; i < 3; i++) {
    const shiftPosition = new ShiftPosition(Heading.EAST, i);
    expect(
      board
        .getFirstMovedTilePosition(shiftPosition)
        .equals(new BoardPosition(6, 1 + i * 2))
    ).toBe(true);
    expect(
      board
        .getLastMovedTilePosition(shiftPosition)
        .equals(new BoardPosition(0, 1 + i * 2))
    ).toBe(true);
  }
  for (let i = 0; i < 3; i++) {
    const shiftPosition = new ShiftPosition(Heading.SOUTH, i);
    expect(
      board
        .getFirstMovedTilePosition(shiftPosition)
        .equals(new BoardPosition(1 + i * 2, 6))
    ).toBe(true);
    expect(
      board
        .getLastMovedTilePosition(shiftPosition)
        .equals(new BoardPosition(1 + i * 2, 0))
    ).toBe(true);
  }
  for (let i = 0; i < 3; i++) {
    const shiftPosition = new ShiftPosition(Heading.WEST, i);
    expect(
      board
        .getFirstMovedTilePosition(shiftPosition)
        .equals(new BoardPosition(0, 1 + i * 2))
    ).toBe(true);
    expect(
      board
        .getLastMovedTilePosition(shiftPosition)
        .equals(new BoardPosition(6, 1 + i * 2))
    ).toBe(true);
  }
});

test("rotateLooseTile", () => {
  const game = Game.buildFromSetup({
    playerCount: 2,
    seed: "Hello world",
  });
  let board = game.gameState.board;
  const loseTile = board.looseTile;
  board = board.rotateLooseTile(2);
  const nextLooseTile = board.looseTile.rotate(-2);
  expect(loseTile.equals(nextLooseTile)).toBe(true);
});

test("shift", () => {
  const game = Game.buildFromSetup({
    playerCount: 2,
    seed: "Hello world",
  });
  let board = game.gameState.board;
  const columnBefore: PathTile[] = [];
  for (let y = 0; y < 7; y++) {
    columnBefore[y] = board.getTile(new BoardPosition(1, y));
  }
  const looseTileBefore = board.looseTile;
  board = board
    .setShiftPosition(new ShiftPosition(Heading.NORTH, 0))
    .insertLooseTile();
  expect(looseTileBefore.equals(board.getTile(new BoardPosition(1, 0)))).toBe(
    true
  );
  for (let y = 1; y < 6; y++) {
    expect(
      board.getTile(new BoardPosition(1, y)).equals(columnBefore[y - 1])
    ).toBe(true);
  }
});

test("generatePlayerHomePositions", () => {
  const homePoints = Board.generatePlayerHomePositions(7, 7);
  expect(homePoints.length).toBe(4);
  expect(homePoints[0].equals(new BoardPosition(0, 0))).toBeTruthy();
  expect(homePoints[1].equals(new BoardPosition(0, 6))).toBeTruthy();
  expect(homePoints[2].equals(new BoardPosition(6, 0))).toBeTruthy();
  expect(homePoints[3].equals(new BoardPosition(6, 6))).toBeTruthy();
});

test("getValidSizes", () => {
  const sizes = Board.getValidSizes(20);
  const expected = [7, 9, 11, 13, 17, 19];
  expect(sizes.length === expected.length).toBeTruthy();
  for (let i = 0; i < sizes.length; i++) {
    expect(sizes[i] === expected[i]).toBeTruthy();
  }
});

test("valid getHomePositionIncrement", () => {
  expect(Board.getHomePositionIncrement(7)).toBe(6);
  expect(Board.getHomePositionIncrement(9)).toBe(4);
  expect(Board.getHomePositionIncrement(11)).toBe(5);
  expect(Board.getHomePositionIncrement(13)).toBe(4);
  expect(Board.getHomePositionIncrement(17)).toBe(4);
  expect(Board.getHomePositionIncrement(19)).toBe(6);
});

test("invalid getHomePositionIncrement", () => {
  for (let i = 0; i < 7; i++) {
    try {
      Board.getHomePositionIncrement(i);
      fail("expected error");
    } catch (e) {
      expect(e.message).toBe("Invalid size");
    }
  }
  try {
    Board.getHomePositionIncrement(10);
    fail("expected error");
  } catch (e) {
    expect(e.message).toBe("Invalid size");
  }
});

test("isShiftPositionValid", () => {
  const board = Game.buildFromSetup({
    boardWidth: 9,
    boardHeight: 7,
  }).gameState.board;
  expect(
    board.isShiftPositionValid(new ShiftPosition(Heading.NORTH, -1))
  ).toBeFalsy();
  expect(
    board.isShiftPositionValid(new ShiftPosition(Heading.EAST, 1.5))
  ).toBeFalsy();

  expect(
    board.isShiftPositionValid(new ShiftPosition(Heading.NORTH, 3))
  ).toBeTruthy();
  expect(
    board.isShiftPositionValid(new ShiftPosition(Heading.NORTH, 4))
  ).toBeFalsy();

  expect(
    board.isShiftPositionValid(new ShiftPosition(Heading.EAST, 2))
  ).toBeTruthy();
  expect(
    board.isShiftPositionValid(new ShiftPosition(Heading.EAST, 3))
  ).toBeFalsy();
});
