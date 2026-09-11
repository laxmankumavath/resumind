/**
 * Rough token estimator for AI model prompts. 
 * 1 token ~= 4 chars in English
 */
const countTokens = (text) => {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
};

export { countTokens };
