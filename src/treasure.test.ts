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

test("compare", () => {
  expect(Treasure.compare(new Treasure(1), new Treasure(1))).toBe(true);
  expect(Treasure.compare(new Treasure(1), new Treasure(2))).toBe(false);
  expect(Treasure.compare(null, new Treasure(2))).toBe(false);
  expect(Treasure.compare(new Treasure(1), null)).toBe(false);
  expect(Treasure.compare(null, null)).toBe(true);
});
