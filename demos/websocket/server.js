const WebSocket = require('ws');
const PORT = process.env.PORT || 8081;

const wss = new WebSocket.Server({ port: PORT }, () => {
  console.log(`WebSocket server started on ws://localhost:${PORT}`);
});

const clients = new Map();

function generateLoremWithIntersel() {
  const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 
    'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore',
    'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam',
    'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi',
    'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure'
  ];
  
  const wordCount = Math.floor(Math.random() * 20) + 10;
  const words = [];
  
  const interselPosition = Math.floor(Math.random() * wordCount);
  
  for (let i = 0; i < wordCount; i++) {
    if (i === interselPosition) {
      words.push('intersel');
    } else {
      words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
    }
  }
  
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  
  return words.join(' ') + '.';
}

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

function broadcastMessage(data) {
  const message = {
    type: 'broadcast',
    data,
    timestamp: Date.now()
  };
  
  let sentCount = 0;
  for (const [clientId, client] of clients.entries()) {
    try {
      client.ws.send(JSON.stringify(message));
      sentCount++;
    } catch (error) {
      console.error(`Broadcast error to ${clientId}:`, error.message);
    }
  }
  
  console.log(`Broadcast sent to ${sentCount} clients`);
  return sentCount;
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
            updates: 0,
            broadcasts: 0
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

setInterval(() => {
  if (clients.size > 0) {
    const loremText = generateLoremWithIntersel();
    const broadcastNumber = Math.floor(Math.random() * 1000);
    
    const broadcastData = {
      id: `broadcast_${Date.now()}`,
      type: 'lorem_message',
      message: loremText,
      source: 'server',
    };
    
    const sentTo = broadcastMessage(broadcastData);
    
    if (sentTo > 0) {
      console.log(`Broadcast #${broadcastNumber}: "${loremText.substring(0, 50)}..."`);
      
      for (const [clientId, client] of clients.entries()) {
        client.counters.broadcasts++;
      }
    }
  }
}, 10000);

setTimeout(() => {
  if (clients.size > 0) {
    broadcastMessage({
      type: 'welcome_broadcast',
      message: 'Bienvenue sur le serveur WebSocket Intersel!',
      info: 'Vous recevrez des broadcasts toutes les 10 secondes.'
    });
  }
}, 2000);

console.log('Server ready.');
console.log('Features:');
console.log('- Updates every 8 seconds to counter-block');
console.log('- Broadcasts with "intersel" in Lorem Ipsum every 10 seconds');
console.log('- Welcome message on connection');