export function isQiandaoMode(search = typeof window === "undefined" ? "" : window.location.search) {
  return new URLSearchParams(search).get("platform") === "qiandao";
}

export const subscribeToRuntime = () => () => {};
export const getServerRuntime = () => false;

// The host must forward document visibility/pagehide. Verify this on real devices;
// the shell deliberately does not invent an unsupported cross-WebView bridge.
export function bindBackgroundPause(
  doc: Pick<Document, "hidden" | "addEventListener" | "removeEventListener">,
  target: Pick<Window, "addEventListener" | "removeEventListener">,
  pause: () => void,
) {
  const onVisibility = () => { if (doc.hidden) pause(); };
  doc.addEventListener("visibilitychange", onVisibility);
  target.addEventListener("pagehide", pause);
  return () => {
    doc.removeEventListener("visibilitychange", onVisibility);
    target.removeEventListener("pagehide", pause);
  };
}
