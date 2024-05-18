/**
 * Creates a folder name out of a url by removing the domain and protocol
 * and replacing "/" with "_" and other special characters with "-".
 */
export function getFolderNameFromUrl(url: string): string {
  return url
    .split("://")
    .slice(1) // remove protocol
    .join("")
    .split("/")
    .slice(1) // remove domain
    .join("_") // replace "/" with "_"
    .replace(/[^a-zA-Z0-9_-]/g, "-"); // Replace all other special characters with "-"
}

/** Replaces all characters of `str` that are not a letter, number or "_" with "-". */
export function getFolderName(str: string): string {
  return str.replace(/[^a-zA-Z0-9_-]/g, "-");
}
