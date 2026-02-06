/**
 * Quick port availability checker
 * Run: node check-port.js
 */
const net = require('net');

const PORT = process.env.PORT || 5000;

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`❌ Port ${port} is already in use!`);
        console.log(`\nTo find what's using it:`);
        console.log(`Windows: netstat -ano | findstr :${port}`);
        console.log(`Mac/Linux: lsof -ti:${port}`);
        resolve(false);
      } else {
        console.log(`❌ Error checking port: ${err.message}`);
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      console.log(`✅ Port ${port} is available!`);
      resolve(true);
    });
    
    server.listen(port);
  });
}

async function main() {
  console.log(`\n🔍 Checking port ${PORT} availability...\n`);
  const available = await checkPort(PORT);
  
  if (!available) {
    console.log(`\n💡 Solutions:`);
    console.log(`1. Change PORT in backend/.env to a different port (e.g., 5001)`);
    console.log(`2. Stop the process using port ${PORT}`);
    console.log(`3. Kill the process: lsof -ti:${PORT} | xargs kill (Mac/Linux)`);
    process.exit(1);
  }
  
  console.log(`\n✅ Ready to start backend on port ${PORT}\n`);
  process.exit(0);
}

main();
