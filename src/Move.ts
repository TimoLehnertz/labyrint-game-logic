/**
 * @author Timo lehnertz
 */

import { BoardPosition } from "./BoardPosition";
import { ShiftPosition } from "./ShiftPosition";
import { Treasure } from "./Treasure";

/**
 * Immutable Move class representing a move in the game
 */
export class Move {
  public readonly playerIndex: number;
  public readonly rotateBeforeShift: number; // multiple of 90deg cw
  public readonly shiftPosition: ShiftPosition;
  public readonly from: BoardPosition;
  public readonly to: BoardPosition;
  public readonly collectedTreasure: Treasure | null;

  public constructor(
    playerIndex: number,
    rotateBeforeShift: number,
    shiftPosition: ShiftPosition,
    from: BoardPosition,
    to: BoardPosition,
    collectedTreasure: Treasure | null
  ) {
    this.playerIndex = playerIndex;
    this.rotateBeforeShift = rotateBeforeShift;
    this.shiftPosition = shiftPosition;
    this.from = from;
    this.to = to;
    this.collectedTreasure = collectedTreasure;
  }
}
