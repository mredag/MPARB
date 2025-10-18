# Multi-Platform Auto Response System

Welcome! This guide is written for people who are brand new to technical projects. If you can follow recipes or assemble furniture, you can bring this system to life. Take it one step at a time and keep this page open while you work.

---

## 1. What you are setting up

This project listens to customer messages on **Instagram**, **WhatsApp**, and **Google Reviews**. It uses:

* **n8n** – a visual automation tool that runs the workflows.
* **OpenAI** – writes polite, Turkish-first replies based on the incoming message.
* **PostgreSQL** – stores every message and response so you can review what happened later.

Once everything is running, new messages trigger an automated conversation flow:

1. A message arrives from Instagram/WhatsApp or a Google review.
2. The intake workflow cleans and standardises the data.
3. An AI-powered processor drafts the best reply.
4. A sender workflow responds on the same platform.
5. Logs and any errors are written to the database, and Slack can ping you if something goes wrong.

Think of it as a polite, always-on assistant for your customer channels.

---

## 2. Before you touch the keyboard

You will need a few things prepared. Do not worry—we explain the jargon as we go.

### 2.1 Tools to install

| Tool | Why you need it | How to get it |
| --- | --- | --- |
| **Git** | Downloads this project. | [Git download page](https://git-scm.com/downloads)
| **Docker Desktop** (includes Docker Compose) | Runs n8n and PostgreSQL in ready-made containers. | [Docker Desktop download](https://www.docker.com/products/docker-desktop/)
| **A text editor** | Edits the `.env` settings file. | Examples: [VS Code](https://code.visualstudio.com/), Notepad, TextEdit.

> **Tip:** After installing Docker Desktop, open it once so it can finish its setup. Leave it running while you use this project.

### 2.2 Accounts and keys

You must already have the following API keys or tokens. If you do not, ask the person who manages the platform access.

| Purpose | Variable name | Where it comes from |
| --- | --- | --- |
| Encrypt credentials stored by n8n | `N8N_ENCRYPTION_KEY` | You create this yourself. Run `openssl rand -hex 16` in a terminal or use any strong 32-character random string. |
| Talk to OpenAI | `OPENAI_API_KEY` | OpenAI dashboard. |
| Send Instagram replies | `FB_PAGE_TOKEN` | Meta/Facebook developer console for your Instagram-connected page. |
| Send WhatsApp replies | `WA_PERMANENT_TOKEN` | WhatsApp Business Cloud console. |
| Identify your WhatsApp number | `WA_PHONE_NUMBER_ID` | WhatsApp Business Cloud console. |
| Confirm Meta webhooks | `META_VERIFY_TOKEN` | Any secret phrase you choose; enter the same value in the Meta developer console. |
| Read and reply to Google reviews (optional) | `GOOGLE_SERVICE_ACCOUNT_KEY` (base64), `GOOGLE_LOCATION_ID` | Google Cloud service account + Business Profile. |
| Receive error alerts in Slack (optional) | `SLACK_WEBHOOK_URL` | Slack app configuration. |
| Branding info for messages | `BRAND_NAME`, `BUSINESS_PHONE`, `BOOKING_LINK` | Your company details. |

Keep these values handy—you will paste them into a configuration file in a moment.

---

## 3. Get the project files

1. Open **Terminal** (macOS/Linux) or **Command Prompt / PowerShell** (Windows).
2. Pick a folder where you want the project to live.
3. Run:

   ```bash
   git clone <repository-url>
   cd MPARB
   ```

   Replace `<repository-url>` with the actual Git address you were given. After this command, you are inside the project folder.

> **No Git?** Download the project as a ZIP file instead, unzip it, and open the folder in your terminal.

---

## 4. Create your `.env` settings file

The `.env` file is a private note that feeds secrets into the system. The project ships with a `.env.example` template.

1. Copy the template:

   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your text editor. Every line looks like `NAME=value`.
3. Replace the placeholder values with your real keys from section 2.2. Do not use quotes—just paste the value after the `=` sign.

   Example snippet:

   ```ini
   N8N_ENCRYPTION_KEY=32_character_random_string
   OPENAI_API_KEY=sk-your-openai-key
   FB_PAGE_TOKEN=your-facebook-page-token
   WA_PERMANENT_TOKEN=your-whatsapp-token
   WA_PHONE_NUMBER_ID=1234567890123456
   META_VERIFY_TOKEN=a_secret_phrase_you_choose
   ```

4. Save the file.

> **Safety check:** Never share your `.env` file publicly. It contains real credentials.

For a full explanation of every option, see [`docs/ENV_VARS.md`](docs/ENV_VARS.md).

---

## 5. Start everything up

All commands below are run from the project folder in your terminal.

### For Windows Users (PowerShell/Command Prompt):

1. **Launch the core services** (database + n8n):

   ```bash
   docker-compose up -d
   ```

   The first run may take several minutes while Docker downloads images. Wait until you see messages that the services are running.

2. **Import the automation workflows** using n8n CLI:

   ```bash
   docker exec -u node -it multi_platform_n8n n8n import:workflow --separate --input=/app/workflows
   ```

3. **Activate the workflows** so they react to new messages:

   ```bash
   docker exec -u node -it multi_platform_n8n n8n update:workflow --all --active=true
   ```

4. **Restart n8n** for activation to take effect:

   ```bash
   docker-compose restart n8n
   ```

### For Linux/macOS Users:

1. **Launch the core services**:

   ```bash
   make up
   ```

2. **Import and activate workflows**:

   ```bash
   make import
   make activate
   ```

### Common Issues:

- **Port conflicts**: If PostgreSQL port 5432 is in use, the system will automatically use port 15432
- **Windows permissions**: Run PowerShell as Administrator if you encounter permission errors
- **Docker not running**: Ensure Docker Desktop is running before starting

If anything fails, read the terminal output. Docker must be running, and your `.env` file must be correct.

---

## 6. Meet your control panel (n8n)

1. Open a browser and visit **http://localhost:5678**.
2. If this is the first time, create an admin account when prompted.
3. Go to **Workflows → Active** to confirm that Instagram, WhatsApp, Google, Processor, Sender, and Error Handler workflows are active.
4. Explore the **Executions** tab to see every message that runs through the system.

> Working remotely? Replace `localhost` with the public address of your server. Make sure ports are open or use a tunnel service such as Cloudflare Tunnel or Ngrok.

---

## 7. Connect your external platforms

Follow the official platform guides and use these values during setup:

### Instagram

* **Webhook URL**: `https://<your-domain>/webhook/instagram-intake`
* **Verify Token**: the same `META_VERIFY_TOKEN` you put in `.env`.
* **Events to subscribe to**: `messages`, `messaging_postbacks`.

### WhatsApp Cloud API

* **Webhook URL**: `https://<your-domain>/webhook/whatsapp-intake`
* **Verify Token**: `META_VERIFY_TOKEN`.
* **Events**: `messages`.

### Google Business Profile (optional)

* No webhook needed. The system polls for new reviews every five minutes using your Google credentials.

> Replace `<your-domain>` with the real hostname of your n8n instance. If you are testing locally, use `http://localhost:5678` when a service allows it.

---

## 8. Daily use

* **Check activity**: Visit the n8n dashboard → *Executions*.
* **Pause everything**: Run `make down` to stop the containers.
* **Bring it back**: Run `make up` again (workflows stay imported).
* **View live logs**: `make logs` shows what is happening in real time.
* **Backups**: `make backup` saves the database and workflow files into `backups/`.

---

## 9. Troubleshooting basics

| Problem | What to try |
| --- | --- |
| Docker command fails with “command not found” | Install Docker Desktop or restart it so the `docker` command becomes available. |
| `make up` stops with an error about `.env` | Open `.env` and check for typos or missing values. Every required variable must have a value. |
| n8n page does not load | Ensure `make up` is still running and Docker Desktop shows both containers (`n8n`, `postgres`). |
| Workflows show as inactive | Run `make import` and then `make activate` again. |
| Messages are not sent | Check the **Executions** tab for errors. Confirm your API tokens are still valid and the webhook URLs match exactly. |
| Need detailed environment variable help | Read [`docs/ENV_VARS.md`](docs/ENV_VARS.md). |

If you are stuck, collect screenshots or error messages and share them with your technical support contact.

---

## 10. Want to explore further?

Ready to go beyond the basics? These documents dive deeper:

* [`docs/AGENTS.md`](docs/AGENTS.md) – Complete developer/agent handbook.
* [`docs/INTEGRATION_SUMMARY.md`](docs/INTEGRATION_SUMMARY.md) – Detailed description of every workflow.
* [`docs/PRD.md`](docs/PRD.md) – Product requirements and use cases.

Developers can run automated checks with:

```bash
make test
node scripts/validate_integration.js
```

---

## 11. Glossary (speak the lingo)

* **API key** – A password that lets software talk to another service.
* **Docker container** – A boxed-up mini-computer that runs one piece of the system.
* **n8n** – A drag-and-drop automation tool that runs all workflows.
* **Webhook** – A URL that receives messages when something happens (e.g., a new DM).
* **Workflow** – A sequence of steps (nodes) that describe what to do with each message.

---

## 12. License

MIT License – see [`LICENSE`](LICENSE) for the full text.
