/**
 * @author Timo Lehnertz
 */
import { BoardPosition } from "./BoardPosition";
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
    return new HeadingHelper(this.heading).vec2.multiply(-1);
  }

  public static create(instance: ShiftPosition): ShiftPosition {
    return new ShiftPosition(instance.heading, instance.index);
  }

  public equals(other: ShiftPosition): boolean {
    return this.heading === other.heading && this.index === other.index;
  }

  private static checkOverflow(position: number, size: number): number {
    if (position < 0) {
      return size - 1;
    }
    if (position >= size) {
      return 0;
    }
    return position;
  }

  public shiftPlayer(
    playerPosition: BoardPosition,
    width: number,
    height: number
  ): BoardPosition {
    const isXAxis =
      this.heading === Heading.EAST || this.heading === Heading.WEST;
    const playerAxis = isXAxis ? playerPosition.y : playerPosition.x;
    const shiftAxis = this.index * 2 + 1;
    if (playerAxis === shiftAxis) {
      const increment =
        this.heading === Heading.NORTH || this.heading === Heading.WEST
          ? 1
          : -1;
      if (isXAxis) {
        return playerPosition.setX(
          ShiftPosition.checkOverflow(playerPosition.x + increment, width)
        );
      } else {
        return playerPosition.setY(
          ShiftPosition.checkOverflow(playerPosition.y + increment, height)
        );
      }
    } else {
      return playerPosition;
    }
  }
}
