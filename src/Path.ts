/**
 * @author Timo Lehnertz
 */
import { BoardPosition } from "./BoardPosition";

/**
 * Mutable Path class representing a path from one field to another
 */
export class Path {
  public readonly positions: BoardPosition[];

  public constructor(position: BoardPosition[]) {
    this.positions = position;
  }

  public get length(): number {
    return this.positions.length;
  }

  public getPositionInPath(index: number): BoardPosition {
    return this.positions[index];
  }
}
