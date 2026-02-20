# Kilo-Nod Usage Examples

## Basic Usage

### 1. Start the System

```bash
cd kilo-nod
npm run dev
```

This starts:
- WebSocket server on `ws://localhost:8765`
- Web UI on `http://localhost:3000`

### 2. Test with Mock Kilo

In a separate terminal:

```bash
npm run mock
```

You'll see:
```
[KILO] Mock Kilo Cloud Agent starting...
[KILO] Processing request...
Allow Kilo to edit [src/config.js]?
```

### 3. Approve/Reject in Browser

Open `http://localhost:3000` and:
- Press **A** to approve
- Press **R** to reject
- Press **1-4** for auto-approve

## Advanced Usage

### Use with Real Kilo CLI

```bash
node server/index.js chat "help me build a REST API"
```

The server will:
1. Spawn Kilo CLI with your prompt
2. Parse permission requests
3. Send them to the web UI
4. Inject your decisions back

### Auto-Approve Rules

Press number keys to auto-approve similar requests:

- **1** - Auto-approve for 1 minute
- **2** - Auto-approve for 5 minutes
- **3** - Auto-approve for 15 minutes
- **4** - Auto-approve for 30 minutes

Example:
```
1. Permission appears: "Allow Kilo to edit [src/app.js]?"
2. Press '2' (auto-approve for 5 minutes)
3. All similar "edit" requests auto-approved for 5 minutes
```

### Multiple Permissions

When multiple permissions are pending:

```
Queue: 3 pending
┌─────────────────────────────┐
│ Current: edit [file1.js]    │
│ Next: delete [temp.log]     │
│ Next: run [npm install]     │
└─────────────────────────────┘
```

Approve/reject one at a time. Queue processes automatically.

## Real-World Scenarios

### Scenario 1: Building a Web App

```bash
node server/index.js chat "create a React todo app with local storage"
```

Expected permissions:
1. Create `package.json` → Approve
2. Run `npm install` → Approve
3. Create `src/App.jsx` → Approve
4. Create `src/index.css` → Approve

Tip: Press **2** on first permission to auto-approve all for 5 minutes.

### Scenario 2: Database Migration

```bash
node server/index.js chat "create a database migration for users table"
```

Expected permissions:
1. Create `migrations/001_users.sql` → Approve
2. Run `psql -f migrations/001_users.sql` → **Review carefully** (high risk)

Tip: High-risk operations show in red. Review before approving.

### Scenario 3: Cleanup Task

```bash
node server/index.js chat "delete all .log files in the project"
```

Expected permissions:
1. Delete `debug.log` → Approve
2. Delete `error.log` → Approve
3. Delete `access.log` → Approve

Tip: Press **3** to auto-approve deletions for 15 minutes.

## Risk Levels

### High Risk (Red)
- Delete operations
- `rm -rf` commands
- Destructive actions

**Action**: Review carefully before approving

### Medium Risk (Yellow)
- `.env` files
- `config` files
- `credentials` files

**Action**: Verify target before approving

### Low Risk (Green)
- Read operations
- Standard edits
- Non-destructive commands

**Action**: Safe to approve or auto-approve

## Keyboard Shortcuts Reference

| Key | Action | Duration |
|-----|--------|----------|
| A | Approve | - |
| R | Reject | - |
| 1 | Auto-approve | 1 minute |
| 2 | Auto-approve | 5 minutes |
| 3 | Auto-approve | 15 minutes |
| 4 | Auto-approve | 30 minutes |

## Credit Tracking

The UI shows real-time credit usage:

```
💳 12.50 credits
```

Each permission shows estimated cost:
```
Cost: 0.5 credits
```

Total updates as Kilo processes requests.

## History

View recent activity in the history panel:

```
Recent Activity
───────────────────────────────────────
10:30:45  edit    src/app.js      approve
10:30:32  delete  temp.log        reject
10:30:15  run     npm install     approve
```

Color-coded:
- Green = approved
- Red = rejected

## Troubleshooting

### Permission not detected

If a permission doesn't appear in the UI:

1. Check server console for `[KILO]` output
2. Verify the pattern matches one of:
   - `Allow Kilo to edit [file]?`
   - `Allow Kilo to run [command]?`
   - etc.

3. Add custom pattern to `server/index.js`:

```javascript
const PATTERNS = [
  /Allow Kilo to (edit|read|delete) \[(.+?)\]\?/,
  /Your custom pattern here/,
];
```

### Web UI disconnected

If the status shows "Disconnected":

1. Check server is running
2. Verify WebSocket URL in `App.jsx` matches server port
3. Check browser console for errors
4. Wait 2 seconds for auto-reconnect

### Keyboard shortcuts not working

1. Ensure browser tab is focused
2. Check no input fields are focused
3. Verify permission is currently displayed
4. Try clicking on the permission card first

## Tips & Best Practices

### 1. Use Auto-Approve for Repetitive Tasks

When Kilo is creating multiple similar files:
```
Press '2' on first permission → All similar requests auto-approved for 5 minutes
```

### 2. Review High-Risk Operations

Always review before approving:
- Delete operations
- Commands with `rm -rf`
- Operations on `.env` files

### 3. Monitor Credit Usage

Keep an eye on the credit counter:
```
💳 12.50 credits
```

Set a mental budget before starting.

### 4. Check History

Review what was approved/rejected:
```
Recent Activity shows last 10 decisions
```

### 5. Test with Mock First

Before using with real Kilo:
```bash
npm run mock
```

Practice keyboard shortcuts and workflow.

## Integration Examples

### With CI/CD

```yaml
# .github/workflows/kilo.yml
- name: Start Kilo-Nod
  run: |
    npm run server &
    # Auto-approve all for CI
    echo "y" | kiro-cli chat "run tests"
```

### With Scripts

```bash
#!/bin/bash
# auto-approve-script.sh

# Start server in background
node server/index.js &
SERVER_PID=$!

# Run Kilo with auto-yes
yes | kiro-cli chat "your prompt here"

# Cleanup
kill $SERVER_PID
```

### Remote Access

```bash
# Server
node server/index.js

# Client (different machine)
# Edit web/src/App.jsx:
const { connected, send } = useWebSocket('ws://your-server-ip:8765', {
```

## Performance Tips

### 1. Limit History

History is limited to 50 items by default. Adjust in `App.jsx`:

```javascript
setHistory(prev => [{ ...perm, decision, time: Date.now() }, ...prev.slice(0, 49)])
//                                                                              ^^
//                                                                         Change this
```

### 2. Adjust Reconnect Delay

Default is 2 seconds. Adjust in `useWebSocket.js`:

```javascript
setTimeout(connect, 2000)
//                  ^^^^ Change this
```

### 3. Cleanup Auto-Rules

Default cleanup is every 10 seconds. Adjust in `App.jsx`:

```javascript
const timer = setInterval(() => {
  setAutoRules(prev => prev.filter(r => r.expires > Date.now()))
}, 10000) // Change this
```

## Customization

### Change Theme Colors

Edit `web/src/index.css`:

```css
:root {
  --bg: #0a0a0f;           /* Background */
  --card-bg: rgba(20, 20, 30, 0.85); /* Card background */
  --accent: #6366f1;       /* Accent color */
  --approve: #10b981;      /* Approve button */
  --reject: #ef4444;       /* Reject button */
}
```

### Add Custom Patterns

Edit `server/index.js`:

```javascript
const PATTERNS = [
  /Allow Kilo to (edit|read|delete) \[(.+?)\]\?/,
  /Allow Kilo to run \[(.+?)\]\?/,
  /Your custom pattern: (.+)/,  // Add here
];
```

### Change Ports

Server port in `server/index.js`:
```javascript
const WS_PORT = 8765; // Change this
```

Web UI port in `web/vite.config.js`:
```javascript
server: { port: 3000 } // Change this
```

## Next Steps

1. **Try the mock**: `npm run mock`
2. **Test with real Kilo**: `node server/index.js chat "your prompt"`
3. **Customize**: Edit colors, patterns, shortcuts
4. **Record demo**: `./record-demo.sh`
5. **Deploy**: Build and host on your server

## Support

- Issues: Check `README.md` troubleshooting section
- Patterns: See `FEATURES.md` for supported patterns
- Architecture: See `SUMMARY.md` for technical details
- Structure: See `STRUCTURE.txt` for file organization
