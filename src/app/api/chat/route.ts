import { streamText, generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { getProtectedCompanyId } from "@/lib/company";
import { prisma } from "@/lib/prisma";
import { MANAGER_PROMPT, DISPATCH_PROMPT, COMPLIANCE_PROMPT, SUPPORT_PROMPT } from "@/lib/chat/prompts";
import { getDispatchContext, getComplianceContext, getSupportContext } from "@/lib/chat/db-context";

export const maxDuration = 60;

type AgentType = "dispatch" | "compliance" | "support";

const AGENT_PROMPTS: Record<AgentType, string> = {
  dispatch: DISPATCH_PROMPT,
  compliance: COMPLIANCE_PROMPT,
  support: SUPPORT_PROMPT,
};

const AGENT_NAMES: Record<AgentType, string> = {
  dispatch: "FleetMind Dispatch",
  compliance: "FleetMind Compliance",
  support: "FleetMind Support",
};

const AGENT_COLORS: Record<AgentType, string> = {
  dispatch: "#3B82F6",
  compliance: "#F59E0B",
  support: "#22C55E",
};

const CONTEXT_LOADERS: Record<AgentType, (companyId: string) => Promise<string>> = {
  dispatch: getDispatchContext,
  compliance: getComplianceContext,
  support: getSupportContext,
};

interface Attachment {
  name: string;
  type: string;
  base64?: string;
}

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
  agent?: AgentType;
  attachments?: Attachment[];
}

async function getAnthropicKey(companyId: string): Promise<string | null> {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  const setting = await prisma.setting.findUnique({
    where: { companyId_chiave: { companyId, chiave: "anthropic_api_key" } },
  });
  return setting?.valore || null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildMessages(messages: IncomingMessage[]): any[] {
  return messages.map((m) => {
    if (m.role === "user" && m.attachments && m.attachments.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parts: any[] = [];
      for (const att of m.attachments) {
        if (att.type.startsWith("image/") && att.base64) {
          const match = att.base64.match(/^data:(image\/[^;]+);base64,(.+)$/);
          if (match) {
            parts.push({ type: "image", image: Buffer.from(match[2], "base64"), mimeType: match[1] });
          }
        } else if (att.base64) {
          try {
            const raw = att.base64.split(",")[1];
            const decoded = Buffer.from(raw, "base64").toString("utf-8");
            parts.push({ type: "text", text: `[File: ${att.name}]\n${decoded}` });
          } catch {
            parts.push({ type: "text", text: `[File: ${att.name} — non leggibile]` });
          }
        }
      }
      if (m.content) parts.push({ type: "text", text: m.content });
      return { role: "user", content: parts };
    }
    return { role: m.role, content: m.content };
  });
}

export async function POST(req: Request) {
  try {
    const companyId = await getProtectedCompanyId();
    const body = await req.json();
    const { messages, currentAgent } = body as {
      messages: IncomingMessage[];
      currentAgent: AgentType | null;
    };

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return new Response("Invalid request", { status: 400 });
    }

    const apiKey = await getAnthropicKey(companyId);
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key Anthropic non configurata. Vai su Impostazioni." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const anthropic = createAnthropic({ apiKey });
    const managerModel = anthropic("claude-haiku-4-5-20251001");
    const agentModel = anthropic("claude-sonnet-4-5-20241022");

    const truncated = messages.slice(-20);

    // --- Manager routing ---
    let selectedAgent: AgentType = currentAgent || "dispatch";
    try {
      const result = await generateText({
        model: managerModel,
        system: MANAGER_PROMPT,
        prompt: JSON.stringify({
          message: lastMessage.content || "[allegato]",
          current_agent: currentAgent,
          history: truncated.slice(0, -1).map((m) => ({ role: m.role, content: m.content || "[allegato]" })),
        }),
      });
      const parsed = JSON.parse(result.text);
      if (["dispatch", "compliance", "support"].includes(parsed.agent)) {
        selectedAgent = parsed.agent;
      }
    } catch {
      // fallback
    }

    // --- Load live DB context ---
    const dbContext = await CONTEXT_LOADERS[selectedAgent](companyId);

    const systemMessage = `${AGENT_PROMPTS[selectedAgent]}\n\n${dbContext}`;

    // --- Stream response ---
    const coreMessages = buildMessages(truncated);
    const result = streamText({
      model: agentModel,
      system: systemMessage,
      messages: coreMessages,
    });

    return result.toTextStreamResponse({
      headers: {
        "X-Agent-Type": selectedAgent,
        "X-Agent-Name": AGENT_NAMES[selectedAgent],
        "X-Agent-Color": AGENT_COLORS[selectedAgent],
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Si e verificato un errore. Riprova tra qualche secondo." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
