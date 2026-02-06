/**
 * Verify backend connection and configuration
 * Run: node verify-connection.js
 */
const http = require('http');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const API_URL = `http://localhost:${PORT}/api/health`;

console.log('\n🔍 Verifying Backend Connection...\n');
console.log(`Expected Backend URL: ${API_URL}`);
console.log(`Port: ${PORT}\n`);

// Check if backend is running
function checkBackend() {
  return new Promise((resolve) => {
    const req = http.get(API_URL, { timeout: 3000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status === 'ok') {
            console.log('✅ Backend is running and responding!');
            console.log(`   Status: ${json.status}`);
            console.log(`   Timestamp: ${json.timestamp}`);
            resolve({ success: true, data: json });
          } else {
            console.log('⚠️  Backend responded but with unexpected status');
            resolve({ success: false, error: 'Unexpected response' });
          }
        } catch (e) {
          console.log('⚠️  Backend responded but response is not JSON');
          resolve({ success: false, error: 'Invalid JSON response' });
        }
      });
    });

    req.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        console.log('❌ Backend is NOT running');
        console.log(`   Connection refused on port ${PORT}`);
      } else if (err.code === 'ETIMEDOUT') {
        console.log('❌ Backend connection timeout');
        console.log(`   No response from port ${PORT}`);
      } else {
        console.log(`❌ Connection error: ${err.message}`);
      }
      resolve({ success: false, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      console.log('❌ Backend connection timeout');
      console.log(`   No response from port ${PORT} within 3 seconds`);
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

async function main() {
  const result = await checkBackend();
  
  if (!result.success) {
    console.log('\n📋 Troubleshooting Steps:');
    console.log('1. Start the backend:');
    console.log('   cd backend');
    console.log('   npm run dev');
    console.log('\n2. Or start both frontend and backend:');
    console.log('   npm run dev:all');
    console.log('\n3. Check if port is available:');
    console.log('   cd backend');
    console.log('   npm run check-port');
    console.log('\n4. Verify backend/.env configuration:');
    console.log('   PORT=5000');
    console.log('   DB_HOST=localhost');
    console.log('   DB_NAME=resqmeal_db');
    console.log('\n5. Check CORS configuration in backend/server.js');
    console.log('   Should allow: http://localhost:5173\n');
  } else {
    console.log('\n✅ Backend connection verified successfully!\n');
  }
  
  process.exit(result.success ? 0 : 1);
}

main();
