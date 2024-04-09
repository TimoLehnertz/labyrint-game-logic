import { BoardPosition } from "./BoardPosition";
import { Game } from "./Game";
import { GameState } from "./GameState";
import { generateMoves, generateShiftPositions } from "./MoveGenerator";

test("seeding", () => {
  const game1 = Game.buildFromSetup({
    playerCount: 2,
    seed: "Hello world",
  });
  const game2 = Game.buildFromSetup({
    playerCount: 2,
    seed: "Hello world",
  });
  const game3 = Game.buildFromSetup({
    playerCount: 2,
    seed: "Hello",
  });
  const game4 = Game.buildFromSetup({
    playerCount: 3,
    seed: "Hello",
  });
  expect(game1.gameState.equals(game2.gameState)).toBe(true);
  expect(game2.gameState.equals(game1.gameState)).toBe(true);
  expect(game2.gameState.equals(game3.gameState)).toBe(false);
  expect(game3.gameState.equals(game4.gameState)).toBe(false);
});

test("stringify", () => {
  const game1 = Game.buildFromSetup({
    playerCount: 2,
    seed: "Hello world",
  });
  const game2 = Game.buildFromString(game1.stringify());
  expect(game1.gameState.equals(game2.gameState)).toBe(true);
});

test("undo redo", () => {
  const game = Game.buildFromSetup({
    playerCount: 2,
    seed: "Hello world",
  });

  const shiftPositions = generateShiftPositions(game.gameState);
  const moves = generateMoves(game.gameState, shiftPositions[0], 0);

  const gameStateAtStart = game.gameState;
  game.move(moves[0]);
  const gameStateAfterMove = game.gameState;
  game.undoLastMove();
  const gameStateAfterUndo = game.gameState;
  game.redoLastMove();
  const gameStateAfterRedo = game.gameState;

  expect(gameStateAtStart.equals(gameStateAfterMove)).toBe(false);
  expect(gameStateAtStart.equals(gameStateAfterUndo)).toBe(true);
  expect(gameStateAfterRedo.equals(gameStateAfterMove)).toBe(true);
});

test("treasures", () => {
  const game = Game.buildFromSetup({
    playerCount: 4,
    seed: "Hello world",
  });
  const treasures = [];
  for (let x = 0; x < 7; x++) {
    for (let y = 0; y < 7; y++) {
      const tile = game.gameState.board.getTile(new BoardPosition(x, y));
      if (tile.treasure) {
        treasures.push(tile.treasure);
      }
    }
  }
  console.log(treasures);
});
