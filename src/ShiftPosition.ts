/**
 * @author Timo Lehnertz
 */
import { Heading, HeadingHelper } from "./Heading";
import { Vec2 } from "./Vec2";

/**
 * Immutable ShiftPosition class representing a unique way of shifting on a board
 */
export class ShiftPosition {
  public readonly heading: Heading; // the direction from wich the shift will start
  public readonly index: number; // from left to right or top to bottom

  public constructor(heading: Heading, index: number) {
    this.heading = heading;
    this.index = index;
  }

  public get shiftVector(): Vec2 {
    return new HeadingHelper(this.heading).vec2;
  }
}
