import { Treasure } from "./Treasure";

test("equals", () => {
  for (let i = 0; i < 10; i++) {
    const treasureA = new Treasure(i);
    const treasureB = new Treasure(i);
    expect(treasureA.equals(treasureB)).toBeTruthy();
  }
});

test("notEquals", () => {
  for (let i = 0; i < 10; i++) {
    const treasureA = new Treasure(i);
    const treasureB = new Treasure(i + 1);
    expect(treasureA.equals(treasureB)).toBeFalsy();
  }
});
