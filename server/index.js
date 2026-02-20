const { WebSocketServer } = require('ws');
const { spawn } = require('child_process');
const readline = require('readline');

const WS_PORT = 8765;
const wss = new WebSocketServer({ port: WS_PORT });

const clients = new Set();
const pendingRequests = new Map();
let requestId = 0;

// Permission patterns for Kilo CLI
const PATTERNS = [
  /Allow Kilo to (edit|read|delete) \[(.+?)\]\?/,
  /Allow Kilo to run \[(.+?)\]\?/,
  /Allow Kilo to (create|modify|remove) (.+?)\?/,
  /Permission required: (.+)/
];

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`[WS] Client connected (${clients.size} total)`);

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.type === 'response' && msg.id !== undefined) {
        const req = pendingRequests.get(msg.id);
        if (req) {
          req.resolve(msg.decision);
          pendingRequests.delete(msg.id);
        }
      }
    } catch (e) {
      console.error('[WS] Parse error:', e.message);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[WS] Client disconnected (${clients.size} total)`);
  });
});

function broadcast(data) {
  const msg = JSON.stringify(data);
  clients.forEach(ws => {
    if (ws.readyState === 1) ws.send(msg);
  });
}

function parsePermission(line) {
  for (const pattern of PATTERNS) {
    const match = line.match(pattern);
    if (match) {
      return {
        action: match[1] || 'execute',
        target: match[2] || match[1],
        raw: line
      };
    }
  }
  return null;
}

function detectRisk(action, target) {
  const high = ['delete', 'remove', 'rm -rf'];
  const medium = ['.env', 'config', 'credentials'];
  
  if (high.some(h => action.includes(h) || target.includes(h))) return 'high';
  if (medium.some(m => target.includes(m))) return 'medium';
  return 'low';
}

function extractCredits(line) {
  const match = line.match(/(\d+(?:\.\d+)?)\s*credits?/i);
  return match ? parseFloat(match[1]) : 0;
}

async function waitForDecision(id, timeout = 120000) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      pendingRequests.delete(id);
      resolve('deny');
    }, timeout);

    pendingRequests.set(id, {
      resolve: (decision) => {
        clearTimeout(timer);
        resolve(decision);
      }
    });
  });
}

function spawnKilo(args = []) {
  const kilo = spawn('kiro-cli', args, { stdio: ['pipe', 'pipe', 'pipe'] });
  
  const rl = readline.createInterface({ input: kilo.stdout });
  let totalCredits = 0;

  rl.on('line', async (line) => {
    console.log('[KILO]', line);

    // Track credits
    const credits = extractCredits(line);
    if (credits > 0) {
      totalCredits += credits;
      broadcast({ type: 'credits', total: totalCredits, delta: credits });
    }

    // Detect permission request
    const perm = parsePermission(line);
    if (perm) {
      const id = requestId++;
      const risk = detectRisk(perm.action, perm.target);
      
      broadcast({
        type: 'permission',
        id,
        action: perm.action,
        target: perm.target,
        risk,
        credits: 0.5, // Estimated cost
        timestamp: Date.now()
      });

      const decision = await waitForDecision(id);
      
      if (decision === 'approve' || decision.startsWith('approve:')) {
        kilo.stdin.write('y\n');
        console.log(`[DECISION] Approved request ${id}`);
      } else {
        kilo.stdin.write('n\n');
        console.log(`[DECISION] Rejected request ${id}`);
      }
    }
  });

  kilo.stderr.on('data', (data) => {
    console.error('[KILO ERR]', data.toString());
  });

  kilo.on('close', (code) => {
    console.log(`[KILO] Process exited with code ${code}`);
  });

  return kilo;
}

console.log(`[SERVER] WebSocket server running on ws://localhost:${WS_PORT}`);
console.log('[SERVER] Waiting for web client connection...');

// Auto-spawn Kilo if args provided
if (process.argv.length > 2) {
  const kiloArgs = process.argv.slice(2);
  console.log(`[SERVER] Auto-spawning Kilo with args:`, kiloArgs);
  spawnKilo(kiloArgs);
}
