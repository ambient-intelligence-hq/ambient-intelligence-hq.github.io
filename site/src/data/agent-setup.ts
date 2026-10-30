// Single source for the "set up with your coding agent" prompt. Used by the
// docs (AgentSetup.astro: Quickstart page and the header modal) and the
// homepage. The guide it points to is public/agents/setup.md.
export const AGENT_SETUP_GUIDE_URL = "https://ambient-intelligence-hq.github.io/agents/setup.md";

export const AGENT_SETUP_PROMPT = `Set up Ambient, a video-understanding agent engine, on this machine.
Read the setup guide and follow it:
curl -fsSL ${AGENT_SETUP_GUIDE_URL}
Show me your plan before installing anything`;
