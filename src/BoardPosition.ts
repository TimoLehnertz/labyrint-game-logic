/**
 * @author Timo Lehnertz
 */

import { Vec2 } from "./Vec2";

/**
 * Immutable BoardPosition class representing a location on the board
 * (0|0) is in the top left corner (Northwest)
 */
export class BoardPosition extends Vec2 {
  public isInBounds(width: number, height: number): boolean {
    return this.x >= 0 && this.y >= 0 && this.x < width && this.y < height;
  }

  public isEdge(width: number, height: number): boolean {
    return (
      this.x === 0 ||
      this.y === 0 ||
      this.x === width - 1 ||
      this.y === height - 1
    );
  }

  public add(b: Vec2): BoardPosition {
    return new BoardPosition(this.x + b.x, this.y + b.y);
  }

  public static create(instance: BoardPosition): BoardPosition {
    return new BoardPosition(instance.x, instance.y);
  }

  public setX(x: number): BoardPosition {
    return new BoardPosition(x, this.y);
  }

  public setY(y: number): BoardPosition {
    return new BoardPosition(this.x, y);
  }
}
