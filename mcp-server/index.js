#!/usr/bin/env node

/**
 * Kilo-Nod MCP Server
 * 
 * Provides permission tracking, audit logging, and analytics for Kilo Code.
 * Implements the Model Context Protocol (MCP) for seamless integration.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Configuration
const CONFIG_DIR = join(homedir(), '.kilo-nod');
const AUDIT_LOG_FILE = join(CONFIG_DIR, 'audit.jsonl');
const STATS_FILE = join(CONFIG_DIR, 'stats.json');

// Ensure config directory exists
if (!existsSync(CONFIG_DIR)) {
  mkdirSync(CONFIG_DIR, { recursive: true });
}

// In-memory state
const state = {
  sessions: new Map(),
  currentSession: null,
  stats: loadStats(),
};

function loadStats() {
  if (existsSync(STATS_FILE)) {
    try {
      return JSON.parse(readFileSync(STATS_FILE, 'utf-8'));
    } catch (e) {
      return initStats();
    }
  }
  return initStats();
}

function initStats() {
  return {
    totalCalls: 0,
    byTool: {},
    byRisk: { low: 0, medium: 0, high: 0 },
    sessions: [],
  };
}

function saveStats() {
  writeFileSync(STATS_FILE, JSON.stringify(state.stats, null, 2));
}

function logAudit(entry) {
  const line = JSON.stringify({
    ...entry,
    timestamp: new Date().toISOString(),
    session: state.currentSession,
  }) + '\n';
  
  writeFileSync(AUDIT_LOG_FILE, line, { flag: 'a' });
}

function detectRisk(tool, params) {
  const highRiskTools = ['delete_file', 'execute_command'];
  const highRiskPatterns = ['rm -rf', 'sudo', 'chmod 777'];
  
  if (highRiskTools.includes(tool)) return 'high';
  
  const paramsStr = JSON.stringify(params).toLowerCase();
  if (highRiskPatterns.some(p => paramsStr.includes(p))) return 'high';
  
  const mediumRiskTools = ['write_to_file', 'apply_diff'];
  const mediumRiskFiles = ['.env', 'config', 'credentials', 'secrets'];
  
  if (mediumRiskTools.includes(tool)) return 'medium';
  if (mediumRiskFiles.some(f => paramsStr.includes(f))) return 'medium';
  
  return 'low';
}

function estimateCost(tool) {
  const costs = {
    read_file: 0.1,
    write_to_file: 0.5,
    apply_diff: 0.5,
    delete_file: 0.3,
    execute_command: 1.0,
    search_files: 0.2,
    list_files: 0.1,
    browser_action: 0.8,
    use_mcp_tool: 0.5,
  };
  return costs[tool] || 0.5;
}

// Create MCP server
const server = new Server(
  {
    name: 'kilo-nod',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Tool: Track Permission
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'track_permission',
        description: 'Track a Kilo Code tool call for audit logging and analytics',
        inputSchema: {
          type: 'object',
          properties: {
            tool: {
              type: 'string',
              description: 'Name of the Kilo Code tool being called',
            },
            params: {
              type: 'object',
              description: 'Parameters passed to the tool',
            },
            approved: {
              type: 'boolean',
              description: 'Whether the action was approved',
            },
          },
          required: ['tool', 'params'],
        },
      },
      {
        name: 'start_session',
        description: 'Start a new tracking session',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Session name or description',
            },
          },
        },
      },
      {
        name: 'end_session',
        description: 'End the current tracking session',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_stats',
        description: 'Get usage statistics and analytics',
        inputSchema: {
          type: 'object',
          properties: {
            period: {
              type: 'string',
              enum: ['today', 'week', 'month', 'all'],
              description: 'Time period for statistics',
            },
          },
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'track_permission': {
      const { tool, params, approved = true } = args;
      const risk = detectRisk(tool, params);
      const cost = estimateCost(tool);

      const entry = {
        tool,
        params,
        approved,
        risk,
        cost,
      };

      logAudit(entry);

      // Update stats
      state.stats.totalCalls++;
      state.stats.byTool[tool] = (state.stats.byTool[tool] || 0) + 1;
      state.stats.byRisk[risk]++;
      saveStats();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              tracked: true,
              risk,
              cost,
              totalCalls: state.stats.totalCalls,
            }, null, 2),
          },
        ],
      };
    }

    case 'start_session': {
      const sessionId = `session-${Date.now()}`;
      state.currentSession = sessionId;
      state.sessions.set(sessionId, {
        id: sessionId,
        name: args.name || 'Unnamed Session',
        startTime: new Date().toISOString(),
        calls: [],
      });

      state.stats.sessions.push({
        id: sessionId,
        name: args.name,
        startTime: new Date().toISOString(),
      });
      saveStats();

      return {
        content: [
          {
            type: 'text',
            text: `Session started: ${sessionId}`,
          },
        ],
      };
    }

    case 'end_session': {
      if (state.currentSession) {
        const session = state.sessions.get(state.currentSession);
        if (session) {
          session.endTime = new Date().toISOString();
        }
        state.currentSession = null;
      }

      return {
        content: [
          {
            type: 'text',
            text: 'Session ended',
          },
        ],
      };
    }

    case 'get_stats': {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(state.stats, null, 2),
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Resources: Audit logs
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'audit://logs/recent',
        name: 'Recent Audit Logs',
        description: 'Last 100 audit log entries',
        mimeType: 'application/json',
      },
      {
        uri: 'audit://logs/all',
        name: 'All Audit Logs',
        description: 'Complete audit log history',
        mimeType: 'application/json',
      },
      {
        uri: 'audit://stats',
        name: 'Usage Statistics',
        description: 'Aggregated usage statistics',
        mimeType: 'application/json',
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'audit://logs/recent') {
    if (existsSync(AUDIT_LOG_FILE)) {
      const logs = readFileSync(AUDIT_LOG_FILE, 'utf-8')
        .trim()
        .split('\n')
        .slice(-100)
        .map(line => JSON.parse(line));

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(logs, null, 2),
          },
        ],
      };
    }
  }

  if (uri === 'audit://logs/all') {
    if (existsSync(AUDIT_LOG_FILE)) {
      const logs = readFileSync(AUDIT_LOG_FILE, 'utf-8')
        .trim()
        .split('\n')
        .map(line => JSON.parse(line));

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(logs, null, 2),
          },
        ],
      };
    }
  }

  if (uri === 'audit://stats') {
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(state.stats, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Kilo-Nod MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
