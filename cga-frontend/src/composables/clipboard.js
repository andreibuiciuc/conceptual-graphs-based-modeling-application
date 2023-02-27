export function useClipboard() {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  }

  return {
    copyToClipboard
  }
}