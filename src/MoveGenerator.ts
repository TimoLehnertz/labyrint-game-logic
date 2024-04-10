/**
 * @author Timo Lehnertz
 */
import { GameState } from "./GameState";
import { Move } from "./Move";
import { ShiftPosition } from "./ShiftPosition";

// generateMoves(gameState).choose

export function generateShiftPositions(gameState: GameState): ShiftPosition[] {
  return gameState.board.generateValidShiftPositions();
}

export function generateMoves(
  gameState: GameState,
  shiftPosition: ShiftPosition,
  rotation: number
): Move[] {
  const moves: Move[] = [];
  const playerState = gameState.allPlayerStates.getPlayerToMoveState();
  const reachableFields = gameState.board.getReachablePositions(
    playerState.position
  );
  for (const reachableField of reachableFields) {
    moves.push(
      new Move(
        gameState.allPlayerStates.playerIndexToMove,
        rotation,
        shiftPosition,
        playerState.position,
        reachableField,
        gameState.board.getTreasureAt(reachableField)
      )
    );
  }
  return moves;
}
