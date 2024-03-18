import { BoardPosition } from "./BoardPosition";
import { PlayerColor } from "./Player";
import { PlayerState } from "./PlayerState";
import { Treasure } from "./Treasure";

test("remainingTreasureCount", () => {
  const playerState = new PlayerState(
    [new Treasure(0), new Treasure(1)],
    [new Treasure(0), new Treasure(1), new Treasure(2), new Treasure(3)],
    null,
    new BoardPosition(0, 0)
  );
  expect(playerState.remainingTreasureCount).toBe(4);
});

test("foundTreasureCount", () => {
  const playerState = new PlayerState(
    [new Treasure(0), new Treasure(1)],
    [new Treasure(0), new Treasure(1), new Treasure(2), new Treasure(3)],
    null,
    new BoardPosition(0, 0)
  );
  expect(playerState.foundTreasureCount).toBe(2);
});

test("getFoundTreasure", () => {
  const treasure = new Treasure(1);
  const playerState = new PlayerState(
    [treasure, new Treasure(1)],
    [new Treasure(0), new Treasure(1), new Treasure(2), new Treasure(3)],
    null,
    new BoardPosition(0, 0)
  );
  expect(playerState.getFoundTreasure(0)).toBe(treasure);
});

test("setPosition", () => {
  const positionA = new BoardPosition(0, 1);
  let playerState = new PlayerState([], [], null, positionA);
  expect(playerState.position).toBe(positionA);
  const positionB = new BoardPosition(0, 2);
  playerState = playerState.setPosition(positionB);
  expect(playerState.position).toBe(positionB);
});

test("collectTreasure", () => {
  const currentTreasure = new Treasure(0);
  let playerState = new PlayerState(
    [],
    [],
    currentTreasure,
    new BoardPosition(0, 0)
  );
  expect(playerState.currentTreasure).toBe(currentTreasure);

  playerState = playerState.collectTreasure(currentTreasure);

  expect(playerState.currentTreasure).toBeNull();
  expect(playerState.foundTreasureCount).toBe(1);
  expect(playerState.remainingTreasureCount).toBe(0);
});

test("removeLastTreasure", () => {
  const currentTreasure = new Treasure(0);
  const foundTreasure = new Treasure(1);
  let playerState = new PlayerState(
    [foundTreasure],
    [],
    currentTreasure,
    new BoardPosition(0, 0)
  );
  expect(playerState.currentTreasure).toBe(currentTreasure);
  expect(playerState.foundTreasureCount).toBe(1);

  playerState = playerState.removeLastTreasure();

  expect(playerState.foundTreasureCount).toBe(0);
  expect(playerState.currentTreasure).toBe(foundTreasure);
  expect(playerState.remainingTreasureCount).toBe(1);
});
