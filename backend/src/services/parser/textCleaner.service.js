export const cleanText = (rawText) => {
  if (!rawText) return '';
  
  return rawText
    .replace(/\r\n/g, '\n') // Normalize newlines
    .replace(/\n\s*\n/g, '\n\n') // Remove excessive empty lines
    .replace(/[^\x00-\x7F]/g, ' ') // Remove non-ASCII characters (often problematic bullets)
    .trim();
};
