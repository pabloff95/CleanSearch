export const GOOGLE_REGEX = {
  // Match any Google /search URL with a query string, on any google.* TLD.
  SEARCH: "^https?://(?:[a-z0-9-]+\\.)*google\\.[a-z.]+/search\\?",  
  // Match Google /search URLs that target a specific tab (Images, Videos, News, Shopping, Books, …). These use tbm= and must be left untouched.
  TAB: "^https?://(?:[a-z0-9-]+\\.)*google\\.[a-z.]+/search\\?.*tbm=",
  // Match Google /search URLs that carry a udm= param (strip target when OFF).
  UDM: "^https?://(?:[a-z0-9-]+\\.)*google\\.[a-z.]+/search\\?.*udm=",
}

export const CHROME_LOCAL_STORAGE_EXTENSION_KEY = "active";
