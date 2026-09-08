/**
 * ─────────────────────────────────────────────────────────────────
 * Cool Technologies — Universal Clipboard Utility
 * ─────────────────────────────────────────────────────────────────
 * Ensures link and text copying works seamlessly across ALL environments:
 * 1. Secure contexts (HTTPS, localhost, 127.0.0.1) via navigator.clipboard
 * 2. Non-secure local network IP addresses (e.g. http://192.168.1.12:3000)
 *    where navigator.clipboard is undefined, using document.execCommand
 * 3. Graceful fallback to prompt for sandboxed/restricted web views
 * ─────────────────────────────────────────────────────────────────
 */

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Try modern navigator.clipboard if supported and running in a secure context
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function" &&
    (window.isSecureContext || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("[Clipboard] Modern clipboard API rejected, trying fallback:", err);
    }
  }

  // 2. Robust fallback for non-secure HTTP LAN IPs (e.g. http://192.168.x.x:3000)
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Prevent zooming/scrolling on iOS/Android and hide off-screen
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "-9999px";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    textArea.setAttribute("readonly", "");
    textArea.setAttribute("aria-hidden", "true");

    document.body.appendChild(textArea);

    // Focus and select the text
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, text.length);

    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (successful) {
      return true;
    }
  } catch (fallbackErr) {
    console.warn("[Clipboard] execCommand fallback failed:", fallbackErr);
  }

  // 3. Fallback prompt for restricted environments
  try {
    window.prompt("Press Ctrl+C (or Cmd+C) to copy link:", text);
    return true;
  } catch {
    return false;
  }
}
