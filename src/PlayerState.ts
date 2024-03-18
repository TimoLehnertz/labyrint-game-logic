/**
 * @author Timo Lehnertz
 */
import { BoardPosition } from "./BoardPosition";
import { Treasure } from "./Treasure";

/**
 * Immutable Playerstate class containing all information about a player.
 * Only publicly exposes the information that other players and the player itself can legaly know
 */
export class PlayerState {
  private readonly foundTreasures: Treasure[];
  private readonly remainingTreasures: Treasure[];
  public readonly currentTreasure: Treasure | null;
  public readonly position: BoardPosition;

  public constructor(
    foundTreasures: Treasure[],
    remainingTreasures: Treasure[],
    currentTreasure: Treasure | null,
    position: BoardPosition
  ) {
    this.foundTreasures = foundTreasures;
    this.remainingTreasures = remainingTreasures;
    this.currentTreasure = currentTreasure;
    this.position = position;
  }

  /**
   * Returns the number of remaining treasures to be found including the currently open treasure
   */
  public get remainingTreasureCount(): number {
    return this.remainingTreasures.length;
  }

  public get foundTreasureCount(): number {
    return this.foundTreasures.length;
  }

  public getFoundTreasure(index: number): Treasure {
    return this.foundTreasures[index];
  }

  public setPosition(newPosition: BoardPosition): PlayerState {
    return new PlayerState(
      this.foundTreasures,
      this.remainingTreasures,
      this.currentTreasure,
      newPosition
    );
  }

  public collectTreasure(treasure: Treasure): PlayerState {
    const newFoundTreasures = this.copyFoundTreasures();
    const newRemainingTreasures = this.copyRemainingTreasures();
    const newCurrentTreasure = newRemainingTreasures.pop() ?? null;
    newFoundTreasures.push(treasure);
    return new PlayerState(
      newFoundTreasures,
      newRemainingTreasures,
      newCurrentTreasure,
      this.position
    );
  }

  public removeLastTreasure(): PlayerState {
    const newFoundTreasures = this.copyFoundTreasures();
    const newRemainingTreasures = this.copyRemainingTreasures();
    if (this.currentTreasure !== null) {
      newRemainingTreasures.push(this.currentTreasure);
    }
    const newCurrentTreasure = newFoundTreasures.pop() ?? null;
    return new PlayerState(
      newFoundTreasures,
      newRemainingTreasures,
      newCurrentTreasure,
      this.position
    );
  }

  /**
   * Treasures are immutable so we dont need to make a deep copy here
   */
  private copyFoundTreasures(): Treasure[] {
    const newFoundTreasures = [];
    for (const foundTreasure of this.foundTreasures) {
      newFoundTreasures.push(foundTreasure);
    }
    return newFoundTreasures;
  }

  /**
   * Treasures are immutable so we dont need to make a deep copy here
   */
  private copyRemainingTreasures(): Treasure[] {
    const newRemainingTreasures = [];
    for (const remainingTreasure of this.remainingTreasures) {
      newRemainingTreasures.push(remainingTreasure);
    }
    return newRemainingTreasures;
  }
}
