# Kilo-Nod Project Summary

## Overview
Kilo-Nod is a cross-platform permission overlay for Kilo Cloud Agents, inspired by claude-nod. It provides a beautiful web-based UI for managing Kilo CLI permission requests with keyboard shortcuts, auto-approve rules, and real-time credit tracking.

## Architecture

### Components
1. **Node.js WebSocket Server** (`server/index.js`)
   - Spawns Kilo CLI as child process
   - Parses stdout for permission patterns
   - Broadcasts requests to web clients via WebSocket
   - Injects user decisions back to Kilo stdin

2. **React Web UI** (`web/src/`)
   - Glassmorphism design with modern aesthetics
   - Real-time WebSocket connection
   - Keyboard shortcuts (A/R/1-9)
   - Auto-approve rules with expiration
   - Activity history tracking
   - Credit usage monitoring

3. **Mock Kilo CLI** (`mock/kilo-mock.js`)
   - Simulates Kilo permission requests
   - For testing without real Kilo CLI

## Key Features Implemented

### Permission Detection
- Pattern matching for common Kilo prompts
- Extracts action type and target
- Risk level detection (high/medium/low)

### Risk Analysis
- **High**: delete, remove, rm -rf operations
- **Medium**: .env, config, credentials files
- **Low**: standard operations

### Credit Tracking
- Parses credit usage from Kilo output
- Real-time total tracking
- Per-request cost estimation

### Auto-Approve Rules
- Approve similar actions for N minutes
- Automatic expiration
- Visual feedback in UI

### Keyboard Shortcuts
- `A` - Approve current request
- `R` - Reject current request
- `1-9` - Auto-approve for preset durations

### Queue Management
- Multiple pending requests
- Sequential processing
- Queue count display

## Files Created

```
kilo-nod/
├── .github/workflows/build.yml    # CI/CD for cross-platform builds
├── .gitignore
├── package.json                   # Root dependencies
├── README.md                      # Full documentation
├── QUICKSTART.md                  # Quick start guide
├── setup.sh                       # Setup script
├── server/
│   └── index.js                   # WebSocket server + Kilo spawner
├── web/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx               # React entry
│       ├── App.jsx                # Main app logic
│       ├── index.css              # Glassmorphism styles
│       ├── components/
│       │   ├── PermissionCard.jsx # Permission display
│       │   ├── StatusBar.jsx      # Connection/credits status
│       │   └── History.jsx        # Activity history
│       └── hooks/
│           ├── useWebSocket.js    # WebSocket connection
│           └── useKeyboard.js     # Keyboard shortcuts
└── mock/
    └── kilo-mock.js               # Mock Kilo CLI for testing
```

## Technical Decisions

### Why Web-Based?
- Cross-platform by default (Linux, macOS, Windows)
- No native code compilation needed
- Easy to customize and extend
- Works in any modern browser
- Can be wrapped in Electron if native app needed

### Why WebSocket?
- Real-time bidirectional communication
- Low latency for permission requests
- Automatic reconnection support
- Standard protocol, widely supported

### Why React?
- Component-based architecture
- Efficient re-rendering
- Large ecosystem
- Easy to maintain

### Minimal Dependencies
- Server: Only `ws` for WebSocket
- Web: Only React + Vite
- No heavy frameworks or unnecessary libraries

## Differences from claude-nod

| Feature | claude-nod | Kilo-Nod |
|---------|-----------|----------|
| Platform | macOS only (Electron + Swift) | Cross-platform (Web) |
| UI | Native menu bar app | Web-based overlay |
| Integration | MCP hooks | Stdout/stdin parsing |
| Distribution | DMG installer | npm + static files |
| Customization | Requires Swift knowledge | HTML/CSS/JS |

## Usage Patterns

### Development
```bash
npm run dev          # Start server + web UI
npm run mock         # Test with mock Kilo
```

### Production
```bash
npm run server       # Start server only
# Deploy web/dist to static hosting
```

### With Real Kilo
```bash
node server/index.js chat "your prompt here"
```

## Future Enhancements

1. **Persistent Storage**
   - Save auto-approve rules to disk
   - Export/import configurations

2. **Advanced Rules**
   - Regex pattern matching
   - Conditional auto-approve
   - Whitelist/blacklist

3. **Desktop App**
   - Electron wrapper
   - System tray integration
   - Native notifications

4. **Analytics**
   - Credit usage graphs
   - Permission patterns
   - Time-based analysis

5. **Multi-User**
   - Team permission policies
   - Audit logs
   - Role-based access

## Testing Strategy

1. **Mock Testing**: Use `kilo-mock.js` to simulate various scenarios
2. **Integration Testing**: Test with real Kilo CLI
3. **UI Testing**: Manual testing of keyboard shortcuts and interactions
4. **Cross-Platform**: GitHub Actions builds for Linux/macOS/Windows

## Deployment Options

1. **Local Development**: Run server + web UI locally
2. **Remote Server**: Deploy server to cloud, access web UI remotely
3. **Static Hosting**: Build web UI, serve from CDN
4. **Electron App**: Package as native desktop application

## Performance Considerations

- WebSocket keeps single persistent connection
- React efficiently updates only changed components
- History limited to 50 items to prevent memory bloat
- Auto-approve rules cleaned up every 10 seconds

## Security Notes

- Server only accepts localhost connections by default
- No authentication (assumes trusted local environment)
- For remote deployment, add authentication layer
- Sensitive file detection helps prevent accidents

## Credits

Inspired by [claude-nod](https://github.com/sreeragh-s/claude-nod) by sreeragh-s.
Adapted for cross-platform use with Kilo Cloud Agents.
