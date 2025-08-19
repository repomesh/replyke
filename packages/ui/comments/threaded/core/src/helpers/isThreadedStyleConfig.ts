import { ThreadedStyleConfig } from "../interfaces/style-props/ThreadedStyleConfig";

export function isThreadedStyleConfig(
  config: Record<string, any>
): config is ThreadedStyleConfig {
  return config.type === "threaded";
}
