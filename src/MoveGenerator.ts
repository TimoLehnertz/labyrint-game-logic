/**
 * @author Timo Lehnertz
 */
import { Board } from "./Board";
import { BoardPosition } from "./BoardPosition";
import { GameState } from "./GameState";
import { Move } from "./Move";
import { ShiftPosition } from "./ShiftPosition";
import { Treasure } from "./Treasure";

const BEST_MOVE_WEIGHT = 10000;

/**
 * Returns a number between 0 and BEST_MOVE_WEIGHT (inclusive) based on the standing
 */
export type EvaluatorFunction = (
  gameState: GameState,
  playerIndex: number
) => number;

export type MoveGenerator = (gameState: GameState) => Move;

export function generateShiftPositions(gameState: GameState): ShiftPosition[] {
  return gameState.board.generateValidShiftPositions();
}

export function generateRandomMove(gameState: GameState): Move {
  const shiftPositions = generateShiftPositions(gameState);
  const shiftPositionIndex = Math.floor(Math.random() * shiftPositions.length);
  const moves = generateMoves(
    gameState,
    shiftPositions[shiftPositionIndex],
    Math.floor(Math.random() * 4)
  );
  const index = Math.floor(Math.random() * moves.length);
  return moves[index];
}

export function generateMoves(
  gameState: GameState,
  toShiftPosition: ShiftPosition,
  rotation: number
): Move[] {
  const moves: Move[] = [];
  const movedGameState = gameState
    .setShiftPosition(toShiftPosition)
    .rotateLooseTile(rotation)
    .insertLooseTile();
  const playerState = movedGameState.allPlayerStates.getPlayerToMoveState();
  const reachableFields = movedGameState.board.getReachablePositions(
    playerState.position
  );
  for (const reachableField of reachableFields) {
    const treasureAtTile = movedGameState.board.getTreasureAt(reachableField);
    let collectedTreasure: Treasure | null = null;
    if (Treasure.compare(treasureAtTile, playerState.currentTreasure)) {
      collectedTreasure = playerState.currentTreasure;
    }
    moves.push(
      new Move(
        movedGameState.allPlayerStates.playerIndexToMove,
        rotation,
        gameState.board.shiftPosition,
        toShiftPosition,
        playerState.position,
        reachableField,
        collectedTreasure
      )
    );
  }
  return moves;
}

export function positionByTreasure(
  board: Board,
  treasure: Treasure
): BoardPosition | null {
  for (let x = 0; x < board.width; x++) {
    for (let y = 0; y < board.height; y++) {
      const tile = board.getTile(new BoardPosition(x, y));
      if (Treasure.compare(tile.treasure, treasure)) {
        return new BoardPosition(x, y);
      }
    }
  }
  return null;
}

function shuffle(array: any[]) {
  let currentIndex = array.length;
  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}

/**
 *
 * @param evaluate Eval function
 * @param strength number between 0 and 1 0 => random move, 1 => strongest move
 * @returns The move generator
 */
export function buildMoveGenerator(
  evaluate: EvaluatorFunction,
  strength: number
): MoveGenerator {
  return (gameState: GameState): Move => {
    let bestMove: Move | null = null;
    let bestStanding = Number.MIN_SAFE_INTEGER;
    for (let rotation = 0; rotation < 4; rotation++) {
      const shiftPositions = generateShiftPositions(gameState);
      for (const shiftPosition of shiftPositions) {
        const moves = generateMoves(gameState, shiftPosition, rotation);
        if (strength < 1) {
          shuffle(moves);
        }
        const lookupAmount = Math.max(
          moves.length - 1,
          Math.min(1, Math.floor(moves.length * strength))
        );
        let i = 0;
        for (const move of moves) {
          if (i >= lookupAmount) {
            break;
          }
          if (move.collectedTreasure !== null) {
            return move;
          }
          let moveFound = false;
          let standing = 0;
          for (const historyMove of gameState.historyMoves) {
            if (historyMove.equals(move)) {
              moveFound = true;
              break;
            }
          }
          if (moveFound) {
            // never prefer a repeated moved move to avoid infinite games between bots
            standing = 0;
          } else {
            const potentialState = gameState.move(move);
            standing = evaluate(
              potentialState,
              gameState.allPlayerStates.playerIndexToMove
            );
          }
          if (standing === BEST_MOVE_WEIGHT) {
            return move;
          }
          if (standing > bestStanding) {
            bestStanding = standing;
            bestMove = move;
          }
          i++;
        }
      }
    }
    if (bestMove === null) {
      throw new Error("could not find any move");
    }
    return bestMove;
  };
}

export function manhattanEvaluator(gameState: GameState, playerIndex: number) {
  if (gameState.getWinnerIndex() === playerIndex) {
    return BEST_MOVE_WEIGHT;
  }
  const playerState = gameState.allPlayerStates.getPlayerState(playerIndex);
  if (playerState.currentTreasure === null) {
    const home = Board.getPlayerHomePosition(
      playerIndex,
      gameState.board.width,
      gameState.board.height
    );
    // playerState.position.distanceFrom(home) + Math.random() * 5;
    const distance = playerState.position.manhattanDistanceFrom(home);
    return BEST_MOVE_WEIGHT - distance;
  }
  // return Math.random();

  const treasureLocation = positionByTreasure(
    gameState.board,
    playerState.currentTreasure
  );
  if (treasureLocation === null) {
    return 0; // treasure is on loose tile
  }
  // const distance = playerState.position.distanceFrom(treasureLocation);
  const diff = playerState.position.subtract(treasureLocation);
  if (Math.abs(diff.x) === 1 && Math.abs(diff.y) === 1) {
    return BEST_MOVE_WEIGHT - 1;
  } else {
    const distance =
      playerState.position.manhattanDistanceFrom(treasureLocation);
    return BEST_MOVE_WEIGHT - distance;
  }
}
