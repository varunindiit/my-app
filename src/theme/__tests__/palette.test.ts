import { dark, light, PALETTES } from "@/theme/palette";

/**
 * Dark mode fails quietly: a token missing from one palette shows up as an
 * `undefined` colour, which React Native renders as transparent rather than
 * throwing. This locks the two palettes to the same shape.
 */
describe("theme palettes", () => {
  it("defines the same tokens in light and dark", () => {
    expect(Object.keys(dark).sort()).toEqual(Object.keys(light).sort());
  });

  it("has no empty colour values", () => {
    for (const [name, palette] of Object.entries(PALETTES)) {
      for (const [token, value] of Object.entries(palette)) {
        expect(`${name}.${token}=${value}`).toMatch(/=(#|rgba?\()/);
      }
    }
  });

  it("uses different backgrounds for the two schemes", () => {
    expect(light.background).not.toBe(dark.background);
    expect(light.text).not.toBe(dark.text);
  });
});
