/**
 * @author Timo Lehnertz
 */
import { BoardPosition } from "./BoardPosition";
import { Heading } from "./Heading";

export interface PathPart {
  from: BoardPosition;
  to: BoardPosition;
  heading: Heading;
}

/**
 * Mutable Path class representing a path from one field to another
 */
export class Path {
  public readonly parts: PathPart[];

  public constructor(parts: PathPart[]) {
    this.parts = parts;
  }

  public get length(): number {
    return this.parts.length;
  }

  public getPart(index: number): PathPart {
    return this.parts[index];
  }
}
