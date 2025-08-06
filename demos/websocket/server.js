const WebSocket = require('ws');
const PORT = process.env.PORT || 8081;

const wss = new WebSocket.Server({ port: PORT }, () => {
  console.log(`WebSocket server started on ws://localhost:${PORT}`);
});

const clients = new Map();

function sendBlapyCommand(ws, command, data = {}) {
  const message = {
    type: 'blapy_command',
    command,
    data,
    timestamp: Date.now()
  };

  try {
    ws.send(JSON.stringify(message));
    console.log(`Sent '${command}' to ${data.params?.embeddingBlockId || 'unknown block'}`);
  } catch (error) {
    console.error('Send error:', error.message);
  }
}

wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  let currentClientId = null;

  console.log(`Client connected from ${ip}`);

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === 'identify' && msg.clientId) {
        currentClientId = msg.clientId;
        clients.set(currentClientId, {
          ws,
          counters: {
            updates: 0
          }
        });

        const html = `
          <div>
            <h3>Welcome ${currentClientId}</h3>
            <p>You're connected via WebSocket.</p>
            <small>${new Date().toLocaleTimeString()}</small>
          </div>
        `;

        sendBlapyCommand(ws, 'updateBlock', {
          html,
          params: { embeddingBlockId: 'welcome-block' }
        });

        console.log(`Client identified as '${currentClientId}'`);
      }

      if (msg.type === 'pong') {
        console.log(`Pong from ${currentClientId}`);
      }

    } catch (err) {
      console.error('Message parse error:', err.message);
    }
  });

  ws.on('close', () => {
    if (currentClientId) {
      clients.delete(currentClientId);
      console.log(`Client '${currentClientId}' disconnected`);
    }
  });

  ws.on('error', (err) => {
    console.error(`Error from ${currentClientId || 'unknown'}: ${err.message}`);
  });
});

setInterval(() => {
  for (const [clientId, client] of clients.entries()) {
    client.counters.updates++;

    const html = `
      <div style="padding: 8px; border-left: 4px solid #2196F3; background: #e3f2fd;">
        <strong>Client: ${clientId}</strong><br>
        Update #${client.counters.updates}<br>
        <small>${new Date().toLocaleTimeString()}</small>
      </div>
    `;

    sendBlapyCommand(client.ws, 'updateBlock', {
      html,
      params: { embeddingBlockId: 'counter-block' }
    });
  }
}, 8000);

console.log('Server ready.');
