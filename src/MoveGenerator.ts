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
  shiftPosition: ShiftPosition,
  rotation: number
): Move[] {
  const moves: Move[] = [];
  const movedGameState = gameState.insertTile(shiftPosition);
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
        shiftPosition,
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

export function buildBestMoveGenerator() {
  const lastMoves: Move[] = [];

  const moveExists = (move: Move): boolean => {
    for (let i = 0; i < lastMoves.length; i++) {
      const lastMove = lastMoves[i];
      if (lastMove.equals(move)) {
        return true;
      }
    }
    return false;
  };

  const findBestMove = (gameState: GameState): Move => {
    let bestMove: Move | null = null;
    let bestStanding = Number.MIN_SAFE_INTEGER;
    for (let rotation = 0; rotation < 4; rotation++) {
      const shiftPositions = generateShiftPositions(gameState);
      for (const shiftPosition of shiftPositions) {
        const moves = generateMoves(gameState, shiftPosition, rotation);
        for (const move of moves) {
          if (moveExists(move)) {
            // console.log("exists");
            // continue;
          }
          if (move.collectedTreasure !== null) {
            return move;
          }
          const potentialState = gameState.move(move);
          const standing = evaluate(
            potentialState,
            gameState.allPlayerStates.playerIndexToMove
          );
          if (standing === BEST_MOVE_WEIGHT) {
            return move;
          }
          if (standing > bestStanding) {
            bestStanding = standing;
            bestMove = move;
          }
        }
      }
    }
    if (bestMove === null) {
      throw new Error("could not find any move");
    }
    return bestMove;
  };
  const wrapper = (gameState: GameState): Move => {
    const move = findBestMove(gameState);
    lastMoves.push(move);
    if (lastMoves.length > 100) {
      lastMoves.shift();
    }
    return move;
  };
  return wrapper;
}

export function evaluate(gameState: GameState, playerIndex: number) {
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
  const distance = playerState.position.manhattanDistanceFrom(treasureLocation);
  return BEST_MOVE_WEIGHT - distance;
}
