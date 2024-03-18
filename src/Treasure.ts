/**
 * @author Timo lehnertz
 */

/**
 * Immutable Treasure class representing a treasure
 */
export class Treasure {
  public readonly id: number;

  public constructor(id: number) {
    this.id = id;
  }

  public equals(other: Treasure): boolean {
    return this.id === other.id;
  }
}
