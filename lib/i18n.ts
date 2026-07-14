import { messages, type MessageKey } from "@/messages/pt-BR";

export function t(key: MessageKey, vars?: Record<string, string>): string {
  let text: string = messages[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, v);
    }
  }
  return text;
}
