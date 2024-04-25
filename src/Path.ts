/**
 * @author Timo Lehnertz
 */
import { BoardPosition } from "./BoardPosition";
import { Heading, HeadingHelper } from "./Heading";

export interface PathPart {
  from: BoardPosition;
  to: BoardPosition;
  heading: Heading;
}

export interface IndexedPathPart {
  from: PathPart;
  to: PathPart;
}

/**
 * Mutable Path class representing a path from one field to another
 */
export class Path {
  public readonly parts: PathPart[];
  // private readonly indexedParts: (IndexedPathPart | null)[][] = [];

  public constructor(parts: PathPart[]) {
    this.parts = parts;
    // for (let x = 0; x < width; x++) {
    //   for (let x = 0; x < width; x++) {
    //     const element = array[x];

    //   }
    // }
  }

  public getHeadings(position: BoardPosition): Heading[] {
    const headings: Heading[] = [];
    for (const part of this.parts) {
      if (part.from.equals(position)) {
        headings.push(part.heading);
      } else if (part.to.equals(position)) {
        headings.push(new HeadingHelper(part.heading).inverted);
      }
    }
    return headings;
  }

  public get length(): number {
    return this.parts.length;
  }

  public getPart(index: number): PathPart {
    return this.parts[index];
  }
}
