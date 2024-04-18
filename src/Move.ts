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
  public readonly fromShiftPosition: ShiftPosition;
  public readonly toShiftPosition: ShiftPosition;
  public readonly from: BoardPosition;
  public readonly to: BoardPosition;
  public readonly collectedTreasure: Treasure | null;

  public constructor(
    playerIndex: number,
    rotateBeforeShift: number,
    fromShiftPosition: ShiftPosition,
    toShiftPosition: ShiftPosition,
    from: BoardPosition,
    to: BoardPosition,
    collectedTreasure: Treasure | null
  ) {
    this.playerIndex = playerIndex;
    this.rotateBeforeShift = rotateBeforeShift;
    this.fromShiftPosition = fromShiftPosition;
    this.toShiftPosition = toShiftPosition;
    this.from = from;
    this.to = to;
    this.collectedTreasure = collectedTreasure;
  }

  public static create(instance: Move): Move {
    return new Move(
      instance.playerIndex,
      instance.rotateBeforeShift,
      ShiftPosition.create(instance.fromShiftPosition),
      ShiftPosition.create(instance.toShiftPosition),
      BoardPosition.create(instance.from),
      BoardPosition.create(instance.to),
      instance.collectedTreasure === null
        ? null
        : Treasure.create(instance.collectedTreasure)
    );
  }

  public equals(other: Move): boolean {
    return (
      this.playerIndex !== other.playerIndex &&
      this.rotateBeforeShift !== other.rotateBeforeShift &&
      this.fromShiftPosition.equals(other.fromShiftPosition) &&
      this.toShiftPosition.equals(other.toShiftPosition) &&
      this.from.equals(other.from) &&
      this.to.equals(other.to) &&
      Treasure.compare(this.collectedTreasure, other.collectedTreasure)
    );
  }
}
