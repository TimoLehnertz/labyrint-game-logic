import { AllPlayerStates } from "./AllPlayerStates";
import { BoardPosition } from "./BoardPosition";
import { PlayerState } from "./PlayerState";
import { Treasure } from "./Treasure";

test("collectTreasure", () => {
  let allPlayerStates = new AllPlayerStates(
    [new PlayerState([], [], null, new BoardPosition(0, 0))],
    0
  );
  const treasure = new Treasure(0);
  expect(allPlayerStates.getPlayerState(0).foundTreasureCount).toBe(0);
  allPlayerStates = allPlayerStates.collectTreasure(0, treasure);
  expect(allPlayerStates.getPlayerState(0).foundTreasureCount).toBe(1);
});

test("removeLastTreasure", () => {
  const treasure = new Treasure(0);
  let allPlayerStates = new AllPlayerStates(
    [new PlayerState([treasure], [], new Treasure(1), new BoardPosition(0, 0))],
    0
  );
  expect(allPlayerStates.getPlayerState(0).foundTreasureCount).toBe(1);
  allPlayerStates = allPlayerStates.removeLastTreasure(0);
  expect(allPlayerStates.getPlayerState(0).foundTreasureCount).toBe(0);
});

test("mutateAll", () => {
  let allPlayerStates = new AllPlayerStates(
    [new PlayerState([], [], null, new BoardPosition(0, 0))],
    0
  );
  expect(allPlayerStates.getPlayerState(0).foundTreasureCount).toBe(0);
  allPlayerStates = allPlayerStates.mutateAll((playerState: PlayerState) => {
    return playerState.collectTreasure(new Treasure(0));
  });
  expect(allPlayerStates.getPlayerState(0).foundTreasureCount).toBe(1);
});

test("movePlayer", () => {
  let allPlayerStates = new AllPlayerStates(
    [new PlayerState([], [], null, new BoardPosition(0, 0))],
    0
  );
  expect(allPlayerStates.getPlayerState(0).position.x).toBe(0);
  allPlayerStates = allPlayerStates.movePlayer(0, new BoardPosition(123, 0));
  expect(allPlayerStates.getPlayerState(0).position.x).toBe(123);
});

test("nextPlayer", () => {
  let allPlayerStates = new AllPlayerStates(
    [
      new PlayerState([], [], null, new BoardPosition(0, 0)),
      new PlayerState([], [], null, new BoardPosition(0, 0)),
    ],
    0
  );
  expect(allPlayerStates.playerIndexToMove).toBe(0);
  allPlayerStates = allPlayerStates.nextPlayer();
  expect(allPlayerStates.playerIndexToMove).toBe(1);
  allPlayerStates = allPlayerStates.nextPlayer();
  expect(allPlayerStates.playerIndexToMove).toBe(0);
});

test("prevPlayer", () => {
  let allPlayerStates = new AllPlayerStates(
    [
      new PlayerState([], [], null, new BoardPosition(0, 0)),
      new PlayerState([], [], null, new BoardPosition(0, 0)),
    ],
    0
  );
  expect(allPlayerStates.playerIndexToMove).toBe(0);
  allPlayerStates = allPlayerStates.prevPlayer();
  expect(allPlayerStates.playerIndexToMove).toBe(1);
  allPlayerStates = allPlayerStates.prevPlayer();
  expect(allPlayerStates.playerIndexToMove).toBe(0);
});

test("getPlayerStatesWithAllTreasures", () => {
  let allPlayerStates = new AllPlayerStates(
    [
      new PlayerState([], [], new Treasure(1), new BoardPosition(0, 0)), // one to go
      new PlayerState(
        [],
        [new Treasure(1)],
        new Treasure(1),
        new BoardPosition(0, 0)
      ), // two to go
      new PlayerState([new Treasure(1)], [], null, new BoardPosition(0, 0)), // all found
    ],
    0
  );
  const length = allPlayerStates.getPlayerStatesWithAllTreasures().length;
  expect(length).toBe(1);
});

test("equals", () => {
  const a = new AllPlayerStates(
    [
      new PlayerState([], [], new Treasure(1), new BoardPosition(0, 0)),
      new PlayerState(
        [],
        [new Treasure(1)],
        new Treasure(1),
        new BoardPosition(0, 0)
      ),
      new PlayerState([new Treasure(1)], [], null, new BoardPosition(0, 0)),
    ],
    0
  );
  const b = new AllPlayerStates(
    [
      new PlayerState([], [], new Treasure(1), new BoardPosition(0, 0)),
      new PlayerState(
        [],
        [new Treasure(1)],
        new Treasure(1),
        new BoardPosition(0, 0)
      ),
      new PlayerState([new Treasure(1)], [], null, new BoardPosition(0, 0)),
    ],
    0
  );

  const c = new AllPlayerStates(
    [
      new PlayerState([], [], new Treasure(1), new BoardPosition(0, 0)),
      new PlayerState(
        [],
        [new Treasure(1)],
        new Treasure(1),
        new BoardPosition(0, 0)
      ),
      new PlayerState(
        [new Treasure(1)],
        [],
        new Treasure(1),
        new BoardPosition(0, 0)
      ),
    ],
    0
  );

  const d = new AllPlayerStates(
    [
      new PlayerState([], [], new Treasure(1), new BoardPosition(0, 0)),
      new PlayerState(
        [],
        [new Treasure(1)],
        new Treasure(1),
        new BoardPosition(0, 0)
      ),
      new PlayerState(
        [new Treasure(1)],
        [],
        new Treasure(1),
        new BoardPosition(0, 0)
      ),
    ],
    1
  );

  const e = new AllPlayerStates(
    [new PlayerState([], [], new Treasure(1), new BoardPosition(0, 0))],
    1
  );

  expect(a.equals(b)).toBe(true);
  expect(b.equals(a)).toBe(true);
  expect(b.equals(c)).toBe(false);
  expect(c.equals(b)).toBe(false);
  expect(c.equals(d)).toBe(false);
  expect(e.equals(d)).toBe(false);
});
