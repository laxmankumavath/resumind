export const cleanText = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return '';

  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Normalize zero-width and non-breaking spaces
    .replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, ' ')
    // Normalize various bullet point characters to standard bullet
    .replace(/[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25CF\u25CB\u25C6\u25C7\u25BA]/g, ' • ')
    // Normalize curly quotes and apostrophes
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    // Normalize en/em dashes
    .replace(/[\u2013\u2014]/g, '-')
    // Replace tabs with spaces
    .replace(/\t/g, ' ')
    // Remove control characters (except newline)
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Collapse horizontal whitespace
    .replace(/[^\S\n]+/g, ' ')
    // Collapse excessive empty lines
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
};
