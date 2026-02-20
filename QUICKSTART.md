# Kilo-Nod Quick Start

## Installation

```bash
cd kilo-nod
./setup.sh
```

## Running

### Option 1: Full System (Recommended)
```bash
npm run dev
```
Opens:
- Server: ws://localhost:8765
- Web UI: http://localhost:3000

### Option 2: Separate Terminals

**Terminal 1 - Server:**
```bash
npm run server
```

**Terminal 2 - Web UI:**
```bash
npm run web
```

**Terminal 3 - Mock Kilo:**
```bash
npm run mock
```

## Testing

1. Start the system: `npm run dev`
2. Open browser: `http://localhost:3000`
3. In another terminal: `npm run mock`
4. Watch permissions appear in the web UI
5. Use keyboard shortcuts to approve/reject

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `A` | Approve |
| `R` | Reject |
| `1` | Auto-approve 1 min |
| `2` | Auto-approve 5 min |
| `3` | Auto-approve 15 min |
| `4` | Auto-approve 30 min |

## Using with Real Kilo CLI

```bash
node server/index.js chat "help me build a REST API"
```

The server will:
1. Spawn Kilo CLI with your command
2. Parse stdout for permission requests
3. Send them to the web UI
4. Inject your decisions back to Kilo

## Troubleshooting

**Port already in use:**
```bash
# Find process using port 8765
lsof -i :8765
# Kill it
kill -9 <PID>
```

**Web UI won't connect:**
- Ensure server is running first
- Check browser console for errors
- Verify WebSocket URL in App.jsx matches server port

**Permissions not detected:**
- Check server console for [KILO] output
- Verify Kilo CLI outputs expected patterns
- Add custom patterns to server/index.js

## Demo Recording

To create a demo GIF:

```bash
# Linux (using peek)
peek

# macOS (using Kap)
kap

# Or use asciinema for terminal recording
asciinema rec demo.cast
```

Record:
1. Starting the system
2. Mock Kilo requesting permissions
3. Using keyboard shortcuts
4. Viewing history

Convert to GIF and save as `demo.gif`
