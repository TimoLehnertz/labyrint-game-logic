import { Vec2 } from "./Vec2";

test("add", () => {
  const vec2A = new Vec2(1, 2);
  const vec2B = new Vec2(5, -3);
  const vec2C = vec2A.add(vec2B);
  expect(vec2C.x).toBe(6);
  expect(vec2C.y).toBe(-1);
});

test("equals", () => {
  const vec2A = new Vec2(1, 2);
  const vec2B = new Vec2(5, -3);
  const vec2D = new Vec2(5, -3);
  expect(vec2A.equals(vec2B)).toBeFalsy();
  expect(vec2B.equals(vec2D)).toBeTruthy();
});
