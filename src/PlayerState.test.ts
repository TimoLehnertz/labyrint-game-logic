import { BoardPosition } from "./BoardPosition";
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
    [new Treasure(1)],
    currentTreasure,
    new BoardPosition(0, 0)
  );
  expect(playerState.currentTreasure).toBe(currentTreasure);
  expect(playerState.remainingTreasureCount).toBe(2);

  playerState = playerState.collectTreasure(currentTreasure);

  expect(playerState.currentTreasure?.equals(new Treasure(1))).toBe(true);
  expect(playerState.foundTreasureCount).toBe(1);
  expect(playerState.remainingTreasureCount).toBe(1);
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
  expect(playerState.remainingTreasureCount).toBe(2);
});

test("removeLastTreasureEmpty", () => {
  let playerState = new PlayerState([], [], null, new BoardPosition(0, 0));
  expect(playerState.currentTreasure).toBe(null);
  expect(playerState.foundTreasureCount).toBe(0);
  expect(playerState.remainingTreasureCount).toBe(0);

  playerState = playerState.removeLastTreasure();

  expect(playerState.foundTreasureCount).toBe(0);
  expect(playerState.currentTreasure).toBe(null);
  expect(playerState.remainingTreasureCount).toBe(0);
});

test("equals", () => {
  const a = new PlayerState(
    [new Treasure(1)],
    [new Treasure(2)],
    new Treasure(0),
    new BoardPosition(0, 0)
  );
  const b = new PlayerState(
    [new Treasure(1)],
    [new Treasure(2)],
    new Treasure(0),
    new BoardPosition(0, 0)
  );
  const c = new PlayerState(
    [new Treasure(1)],
    [new Treasure(3)],
    new Treasure(0),
    new BoardPosition(0, 0)
  );
  const d = new PlayerState(
    [new Treasure(1)],
    [new Treasure(2)],
    new Treasure(0),
    new BoardPosition(1, 0)
  );
  const e = new PlayerState(
    [new Treasure(1)],
    [new Treasure(2)],
    new Treasure(0),
    new BoardPosition(0, 0)
  );
  const f = new PlayerState(
    [new Treasure(1)],
    [new Treasure(2)],
    new Treasure(2),
    new BoardPosition(0, 0)
  );
  const g = new PlayerState(
    [new Treasure(1), new Treasure(2)],
    [new Treasure(2)],
    new Treasure(2),
    new BoardPosition(0, 0)
  );
  const h = new PlayerState(
    [new Treasure(1), new Treasure(3)],
    [new Treasure(2)],
    new Treasure(2),
    new BoardPosition(0, 0)
  );
  const i = new PlayerState(
    [new Treasure(1), new Treasure(3)],
    [new Treasure(2), new Treasure(1)],
    new Treasure(2),
    new BoardPosition(0, 0)
  );
  expect(a.equals(b)).toBe(true);
  expect(b.equals(a)).toBe(true);
  expect(b.equals(c)).toBe(false);
  expect(c.equals(b)).toBe(false);
  expect(d.equals(e)).toBe(false);
  expect(e.equals(f)).toBe(false);
  expect(f.equals(g)).toBe(false);
  expect(g.equals(h)).toBe(false);
  expect(h.equals(i)).toBe(false);
});
