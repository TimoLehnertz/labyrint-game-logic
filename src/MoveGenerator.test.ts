import { Game } from "./Game";
import {
  buildMoveGenerator,
  generateMoves,
  generateRandomMove,
  generateShiftPositions,
  manhattanEvaluator,
} from "./MoveGenerator";
import { printBoard } from "./Utils";

test("all starting moves", () => {
  // let count = 0;
  for (let i = 0; i < 10; i++) {
    const game = Game.buildFromSetup({
      // seed: "seed",
      seed: Math.random() + "",
    });
    const stringified = game.stringify();
    const shiftPositions = generateShiftPositions(game.gameState);
    for (const shiftPosition of shiftPositions) {
      for (let rotation = 0; rotation < 4; rotation++) {
        const moves = generateMoves(game.gameState, shiftPosition, rotation);
        for (const move of moves) {
          const testGame = Game.buildFromString(stringified);
          testGame.move(move);
          // count++;
        }
      }
    }
  }
  // console.log(`tested ${count} starting moves`);
});

// test("random complete game", () => {
//   // let avg = 0;
//   for (let i = 0; i < 1; i++) {
//     const game = Game.buildFromSetup({
//       // seed: "seed",
//       seed: Math.random() + "",
//     });
//     while (true) {
//       const winner = game.gameState.getWinnerIndex();
//       if (winner !== null) {
//         break;
//       }
//       const move = generateRandomMove(game.gameState);
//       console.log(
//         "moved",
//         game.gameState.allPlayerStates.getPlayerState(0).remainingTreasureCount
//       );
//       game.move(move);
//     }
//     try {
//       game.move(123 as any);
//       fail("expected error");
//     } catch (e) {
//       expect(e.message).toBe("cant move after game has ended");
//     }
//     // avg += game.gameState.historyMoves.length / 100;
//     console.log(`game ${i} finished in ${game.gameState.historyMoves.length}`);
//   }
//   // console.log("avg", avg);
// });

// test("random complete 9*9", () => {
//   // let avg = 0;
//   for (let i = 0; i < 1; i++) {
//     const game = Game.buildFromSetup({
//       boardWidth: 9,
//       boardHeight: 7,
//       playerCount: 5,
//       // seed: "seed",
//       seed: Math.random() + "",
//     });
//     while (true) {
//       const winner = game.gameState.getWinnerIndex();
//       if (winner !== null) {
//         break;
//       }
//       const move = generateRandomMove(game.gameState);
//       game.move(move);
//     }
//     try {
//       game.move(123 as any);
//       fail("expected error");
//     } catch (e) {
//       expect(e.message).toBe("cant move after game has ended");
//     }
//     // avg += game.gameState.historyMoves.length / 100;
//     // console.log(`game ${i} finished in ${game.gameState.historyMoves.length}`);
//   }
//   // console.log("avg", avg);
// });

// test("complete 7*7 best move", () => {
//   let avg = 0;
//   const runs = 10;
//   for (let i = 0; i < runs; i++) {
//     const seed = Math.random() + "";
//     const game = Game.buildFromSetup({
//       boardWidth: 7,
//       boardHeight: 7,
//       // seed: "0.19895043778587929",
//       seed: seed,
//     });
//     const moveGenerator = buildMoveGenerator(manhattanEvaluator, 1);
//     // console.log("seed:", seed);
//     while (true) {
//       const winner = game.gameState.getWinnerIndex();
//       if (winner !== null) {
//         break;
//       }
//       const move = moveGenerator(game.gameState);
//       game.move(move);
//       console.log(
//         "moved",
//         game.gameState.allPlayerStates.getPlayerState(0).remainingTreasureCount
//       );
//     }
//     avg += game.gameState.historyMoves.length / runs;
//     console.log(`game ${i} finished in ${game.gameState.historyMoves.length}`);
//   }
//   // console.log("avg", avg);
// });
