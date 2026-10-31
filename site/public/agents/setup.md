---
name: ambient-setup
description: Install Ambient (the open-source video engine for AI agents) and its Studio web UI on this machine with Docker, and verify it works.
version: 1
updated: 2026-10-31
---

# Set up Ambient

You are setting up Ambient for the user on this machine. Ambient runs as four
Docker containers: `engine` (the HTTP API), `studio` (the web UI), `postgres`,
and `redis`.

- Settings, the compose file, and the `ambientctl` tool live in `~/.ambient`.
- Videos and the database live in Docker volumes.
- The installer also links `~/.local/bin/ambientctl` to `~/.ambient/bin/ambientctl`.

**Your job:** install Ambient locally and confirm it works.

**You're done when** the checks in step 5 pass and you've reported back with the
template in step 6. If the user chose to add their API key later, you're still
done: report `key not set` and give them the command to set it.

## Quick reference

```bash
# Install, or re-run safely: an existing install keeps its settings and data.
curl -fsSL https://ambient-intelligence-hq.github.io/install.sh | bash -s -- --yes --no-open

# Use the full path: `ambientctl` alone only works if ~/.local/bin is on PATH.
~/.ambient/bin/ambientctl status    # containers and URLs
~/.ambient/bin/ambientctl start     # start, recreating anything missing
docker compose -f ~/.ambient/docker-compose.yml logs --tail=100 engine   # recent logs
```

Don't run `ambientctl logs`, even though the installer suggests it: it follows
the logs and never exits.

## Boundaries

**Always**
- Check what's already installed first (step 1).
- Show the user your plan, including the exact install command, and wait for
  their go-ahead before installing anything (step 3).
- Verify with step 5 before you say it works.

**Ask first**
- Installing or starting Docker.
- Stopping any container or process that uses a port. Prefer letting the
  installer pick free ports.
- Making Ambient reachable from other machines (`AMBIENT_BIND=0.0.0.0`).
- Running `ambientctl uninstall`.

**Never**
- Print, log, or repeat an API key or secret. Don't `cat` `~/.ambient/.env`,
  and don't run `ambientctl config show` or `ambientctl config get` on keys;
  use the key check in step 2 instead.
- Delete the user's data: no `ambientctl uninstall --purge`, `docker compose down -v`,
  `docker volume rm`, or removing `~/.ambient`.
- Use `sudo` or change firewall or system settings without asking.
- Copy keys anywhere except `~/.ambient/.env` or the install command.

## 1. Check what's already there

```bash
uname -s                                                    # Darwin or Linux (on Windows, use WSL2)
docker version --format '{{.Server.Version}}' && docker compose version --short
test -f ~/.ambient/.env && echo "settings file exists" || echo "no settings file"
test -x ~/.ambient/bin/ambientctl && ~/.ambient/bin/ambientctl status || echo "not installed"
```

- **Docker missing or not running:** stop and ask the user. macOS: install and
  start Docker Desktop. Linux: Docker Engine with the Compose plugin
  (`curl -fsSL https://get.docker.com | sh` needs root, so the user runs it).
  Docker Compose v2 (`docker compose`) is required.
- **Installed, all four services `(healthy)`:** skip to step 5.
- **Installed but stopped, or a service is missing:** run
  `~/.ambient/bin/ambientctl start`, then go to step 5.
- **Not installed, but the settings file exists:** the user has probably written
  it already (option A in step 2). Don't change it; continue with step 2 and
  skip the questions it already answers.
- **Not installed, no settings file:** continue with step 2.

## 2. Settings: ask the user

Ambient needs an LLM provider: an OpenAI-compatible endpoint, a model, and an
API key. The defaults are OpenRouter (`https://openrouter.ai/api/v1`) and
`qwen/qwen3.8-27b` for both models.

Ask the user, in one message:
1. Which provider and models to use, or whether the defaults are fine.
2. How they want to provide the settings: option A or option B below.

**Option A: the user maintains the settings file (recommended for keys).** The
installer reads `~/.ambient/.env` if it exists, so the user writes it and you
never see the key. Give them this to fill in, with plain `KEY=value` lines (no
`export`, no spaces around `=`). They only need the lines they want to change:

```ini
# ~/.ambient/.env  (create the folder first: mkdir -p ~/.ambient)
LLM_API_KEY=
# Optional; these are the defaults:
LLM_BASE_URL=https://openrouter.ai/api/v1
AGENT_MODEL=qwen/qwen3.8-27b
LLM_MODEL=qwen/qwen3.8-27b
```

Wait until they say the file is ready, then run the key check below. The user
can also skip the key: install without it, and they set it afterwards with
`~/.ambient/bin/ambientctl config set LLM_API_KEY <key>` in their own terminal.

**Option B: the user shares the settings with you.** Before they paste a key,
tell them once that it will stay in this conversation's history and their agent
provider's logs. If they're fine with that, pass the values to the installer as
environment variables in step 4, and nowhere else. Never repeat the key back.

Either way, non-secret choices (endpoint, models, ports) can go in the file or
as installer environment variables:

| Setting | In `~/.ambient/.env` | Installer environment variable |
|---|---|---|
| API key | `LLM_API_KEY` | `AMBIENT_LLM_KEY` |
| Endpoint | `LLM_BASE_URL` | `AMBIENT_LLM_BASE_URL` |
| Agent model (plans and answers) | `AGENT_MODEL` | `AMBIENT_MODEL` |
| Video model (must accept video input) | `LLM_MODEL` | `AMBIENT_VIDEO_MODEL` |
| Studio port | `AMBIENT_STUDIO_PORT` | `AMBIENT_STUDIO_PORT` |
| API port | `AMBIENT_ENGINE_PORT` | `AMBIENT_ENGINE_PORT` |

Installer environment variables win over `~/.ambient/.env`, which wins over the
defaults. Variables exported in the shell that started you also count; check
the names only with `env | grep -o '^AMBIENT_[A-Z_]*'`.

Leave the ports out unless the user asks for specific ones. Default ports that
are taken are swapped for free ones automatically; a port passed as an
environment variable must be free, or the installer stops with an error.

Key check, which never shows the key:

```bash
grep -q '^LLM_API_KEY=.' ~/.ambient/.env && echo "key set" || echo "key not set"
```

## 3. Show your plan and wait

Tell the user what you'll run, with the exact command from step 4 (with any
key shown as `<your key>`). Mention that the first install downloads about
1.5 GB of images and takes a few minutes. Wait for their go-ahead.

## 4. Install

```bash
curl -fsSL https://ambient-intelligence-hq.github.io/install.sh | bash -s -- --yes --no-open
```

To pass settings (option B, or non-secret choices), put the variables after the
pipe, on the `bash` side:

```bash
curl -fsSL https://ambient-intelligence-hq.github.io/install.sh \
  | AMBIENT_LLM_KEY='<key>' AMBIENT_MODEL='<model>' bash -s -- --yes --no-open
```

It ends by printing `All services healthy` and the Studio and API URLs. Read the
printed ports rather than assuming 3000 and 8080. Without a key it still
installs and prints `key not set`.

## 5. Verify

```bash
~/.ambient/bin/ambientctl status
curl -fsS http://localhost:<API port>/v1/healthz        # expect: {"status":"ok"}
curl -fsS http://localhost:<Studio port>/ping           # expect: pong
grep -q '^LLM_API_KEY=.' ~/.ambient/.env && echo "key set" || echo "key not set"
```

`status` should list `engine`, `studio`, `postgres`, and `redis`, each
`Up … (healthy)`, followed by the Studio and API URLs.

If the key isn't set, ask the user to run this in their own terminal (not in
this chat), and re-run the key check when they say it's done:

```bash
~/.ambient/bin/ambientctl config set LLM_API_KEY <key>
```

If they'd rather do it later, go on to step 6.

Don't send test questions yourself; they use the user's LLM credits. The user
tries it in Studio.

## 6. Report back

Tell the user, filling in the real values:

```text
Ambient is running.
- Studio: http://localhost:<port>. Add a video and ask a question.
- API: http://localhost:<port> (Anthropic SDK base_url). Get its key yourself
  with: ~/.ambient/bin/ambientctl config get ENGINE_API_KEY
- LLM: <endpoint>, agent <model>, video <model>, key set
  (or: key not set. Run ~/.ambient/bin/ambientctl config set LLM_API_KEY <key>
  in your own terminal before asking questions.)
- Manage it: ~/.ambient/bin/ambientctl status | start | stop | update
- Docs: https://ambient-intelligence-hq.github.io/docs/
```

## Troubleshooting

| Symptom | Check | Fix |
|---|---|---|
| `Docker is not installed` or `Cannot connect to the Docker daemon` | `docker info` | Ask the user to install or start Docker. |
| `port N is already in use` | `lsof -iTCP:N -sTCP:LISTEN` | Drop that `AMBIENT_*_PORT` variable so the installer picks a free port, or choose another. Ask before stopping anything. |
| A service is missing from `status`, or Studio shows `engine … -> 500` | `~/.ambient/bin/ambientctl status` | `~/.ambient/bin/ambientctl start` recreates missing containers. |
| `engine` or `studio` is unhealthy or restarting | `docker compose -f ~/.ambient/docker-compose.yml logs --tail=100 engine` | Fix what the log reports; often a wrong model name or endpoint. Change it with `ambientctl config set`. |
| Questions fail with 401 or 403 from the LLM provider | Key check in step 2 | The key is wrong or has no credit. The user sets a new one with `ambientctl config set LLM_API_KEY <key>`. |

## Update or remove

- **Update:** `~/.ambient/bin/ambientctl update` pulls newer images for the
  current version. To update the stack definition too, re-run the install
  command; it keeps the settings.
- **Stop:** `~/.ambient/bin/ambientctl stop`. Start again with `~/.ambient/bin/ambientctl start`.
- **Remove:** `~/.ambient/bin/ambientctl uninstall` removes the containers and
  keeps the data (ask first). Deleting data is the user's call: they run
  `ambientctl uninstall --purge` themselves.

## More

- Full docs as plain text, for agents: https://ambient-intelligence-hq.github.io/llms.txt
- Docs for people: https://ambient-intelligence-hq.github.io/docs/
