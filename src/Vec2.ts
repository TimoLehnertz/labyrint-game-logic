/**
 * @author Timo Lehnertz
 */

/**
 * Immutable Vec2 class
 */
export class Vec2 {
  public readonly x: number;
  public readonly y: number;

  public constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public equals(other: Vec2): boolean {
    return this.x === other.x && this.y === other.y;
  }

  public add(b: Vec2): Vec2 {
    return new Vec2(this.x + b.x, this.y + b.y);
  }
}
