/**
 * Decode HTML entities in a string (e.g., &quot; -> ", &amp; -> &, etc.)
 * Uses the browser's DOM API for safe decoding.
 *
 * @param {string} text - The HTML-encoded string to decode.
 * @returns {string} The decoded text.
 */
export function decodeHTML(text) {
  if (typeof text !== 'string') return '';

  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

/**
 * Shuffle an array using the Fisher-Yates algorithm.
 * Returns a new shuffled array without mutating the original.
 *
 * @param {Array} array - The array to shuffle.
 * @returns {Array} A new shuffled array.
 */
export function shuffle(array) {
  if (!Array.isArray(array)) return [];

  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
