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

  public subtract(b: Vec2): Vec2 {
    return new Vec2(this.x - b.x, this.y - b.y);
  }

  public multiply(scalar: number): Vec2 {
    return new Vec2(this.x * scalar, this.y * scalar);
  }

  public distanceFrom(other: Vec2): number {
    return this.subtract(other).length;
  }

  public manhattanDistanceFrom(other: Vec2): number {
    const diff = this.subtract(other);
    return Math.abs(diff.x) + Math.abs(diff.y);
  }

  public get length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}
