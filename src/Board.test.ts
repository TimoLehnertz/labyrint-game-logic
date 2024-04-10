import { Board } from "./Board";
import { BoardPosition } from "./BoardPosition";
import { Game } from "./Game";
import { Heading } from "./Heading";
import { PathTile } from "./PathTile";
import { ShiftPosition } from "./ShiftPosition";

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
  board = board.shift(new ShiftPosition(Heading.NORTH, 0));
  expect(looseTileBefore.equals(board.getTile(new BoardPosition(1, 0)))).toBe(
    true
  );
  for (let y = 1; y < 7; y++) {
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
