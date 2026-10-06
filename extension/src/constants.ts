export const GOOGLE_REGEX = {
  // Match any Google /search URL with a query string, on any google.* TLD.
  SEARCH: "^https?://(?:[a-z0-9-]+\\.)*google\\.[a-z.]+/search\\?",
  // Match Google /search URLs that target a specific tab (Images, Videos, News, Shopping, Books, …). These use tbm= and must be left untouched.
  TAB: "^https?://(?:[a-z0-9-]+\\.)*google\\.[a-z.]+/search\\?.*tbm=",
  // Google also uses udm= values for search modes such as Images and Videos.
  SEARCH_MODE: "^https?://(?:[a-z0-9-]+\\.)*google\\.[a-z.]+/search\\?.*(?:tbm=|udm=)",
  // Match only the Web mode parameter that must be stripped when the extension is OFF.
  UDM: "^https?://(?:[a-z0-9-]+\\.)*google\\.[a-z.]+/search\\?(?:[^&]*&)*udm=14(?:&|$)",
};

export const CHROME_LOCAL_STORAGE_EXTENSION_KEY = "active";
