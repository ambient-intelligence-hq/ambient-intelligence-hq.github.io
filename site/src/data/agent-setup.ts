// Single source for the "set up with your coding agent" text. Used by the docs
// (AgentSetup.astro: Quickstart page and the header modal) and the homepage
// (AgentSetupModal.astro and the quickstart section). The guide the prompt
// points to is public/agents/setup.md.
export const AGENT_SETUP_GUIDE_URL = "https://ambient-intelligence-hq.github.io/agents/setup.md";

export const AGENT_SETUP_PROMPT = `Set up Ambient, an open-source video engine for AI agents, on this machine.
Read the setup guide and follow it:
curl -fsSL ${AGENT_SETUP_GUIDE_URL}
Show me your plan before installing anything`;

/** Button label and modal title. */
export const AGENT_SETUP_BUTTON = "Set up with your agent";
export const AGENT_SETUP_TITLE = "Set up with your coding agent";

/** Shown above the prompt. */
export const AGENT_SETUP_INTRO = "Paste this into Claude Code, Codex, Cursor, or any agent that can run commands:";

/** Shown below the prompt, after "The agent follows the setup guide for agents." */
export const AGENT_SETUP_NOTE =
  "It checks Docker, asks how you want to provide your API key and settings, shows you its plan, and waits for your go-ahead before installing.";
