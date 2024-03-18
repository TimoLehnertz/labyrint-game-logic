/**
 * @author Timo lehnertz
 */

import { Vec2 } from "./Vec2";

export enum Heading {
  NORTH,
  EAST,
  SOUTH,
  WEST,
}

export class HeadingHelper {
  public readonly heading: Heading;

  public constructor(heading: Heading) {
    this.heading = heading;
  }

  public static getAllHeadings(): Heading[] {
    return [Heading.NORTH, Heading.EAST, Heading.SOUTH, Heading.WEST];
  }

  public get inverted(): Heading {
    switch (this.heading) {
      case Heading.NORTH:
        return Heading.SOUTH;
      case Heading.EAST:
        return Heading.WEST;
      case Heading.SOUTH:
        return Heading.NORTH;
      case Heading.WEST:
        return Heading.EAST;
    }
  }

  public get vec2(): Vec2 {
    switch (this.heading) {
      case Heading.NORTH:
        return new Vec2(0, 1);
      case Heading.EAST:
        return new Vec2(1, 0);
      case Heading.SOUTH:
        return new Vec2(0, -1);
      case Heading.WEST:
        return new Vec2(-1, 0);
    }
  }
}
