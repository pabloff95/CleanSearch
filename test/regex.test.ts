import { describe, test, expect } from "@jest/globals";
import { GOOGLE_REGEX } from "../extension/src/constants.js";

describe("regex", () => {
  describe("GOOGLE_REGEX.SEARCH", () => {
    const re = new RegExp(GOOGLE_REGEX.SEARCH);

    test.each([
      "https://www.google.com/search?q=cats",
      "https://google.com/search?q=cats",
      "https://www.google.co.uk/search?q=cats",
      "https://www.google.de/search?q=cats",
      "http://google.com/search?q=cats",
      "https://images.google.com/search?q=cats",
    ])("matches %s", (url) => {
      expect(re.test(url)).toBe(true);
    });

    test.each([
      "https://www.google.com/maps?q=cats",
      "https://duckduckgo.com/search?q=cats",
      "https://www.google.com/",
      "https://www.google.com/search",
    ])("does not match %s", (url) => {
      expect(re.test(url)).toBe(false);
    });
  });

  describe("GOOGLE_REGEX.TAB", () => {
    const re = new RegExp(GOOGLE_REGEX.TAB);

    test.each([
      "https://www.google.com/search?q=cats&tbm=isch",
      "https://www.google.com/search?q=cats&tbm=nws",
      "https://www.google.com/search?tbm=shop",
    ])("matches %s", (url) => {
      expect(re.test(url)).toBe(true);
    });

    test.each([
      "https://www.google.com/search?q=cats",
      "https://www.google.com/search?q=cats&udm=14",
    ])("does not match %s", (url) => {
      expect(re.test(url)).toBe(false);
    });
  });

  describe("GOOGLE_REGEX.UDM", () => {
    const re = new RegExp(GOOGLE_REGEX.UDM);

    test.each([
      "https://www.google.com/search?q=cats&udm=14",
      "https://www.google.com/search?q=cats&sca_esv=1&udm=14",
    ])("matches %s", (url) => {
      expect(re.test(url)).toBe(true);
    });

    test.each([
      "https://www.google.com/search?q=cats",
      "https://www.google.com/search?q=udm",
    ])("does not match %s", (url) => {
      expect(re.test(url)).toBe(false);
    });
  });
});
