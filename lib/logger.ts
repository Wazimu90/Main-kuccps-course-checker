export type LogLevel = "info" | "warn" | "error" | "debug" | "success"

export function log(scope: string, message: string, level: LogLevel = "info", meta?: unknown) {
  const ts = new Date().toISOString()
  const prefix = `[${ts}][${scope}]`
  try {
    switch (level) {
      case "error":
        console.error(prefix, message, meta ?? "")
        break
      case "warn":
        console.warn(prefix, message, meta ?? "")
        break
      case "debug":
        console.debug(prefix, message, meta ?? "")
        break
      case "success":
        console.log(prefix, `✅ ${message}`, meta ?? "")
        break
      default:
        console.log(prefix, message, meta ?? "")
    }
  } catch {
    // no-op: never throw from logging
  }
}
