// Test script to post food via API
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Test with JWT token (you need to get a valid token from login first)
async function testPostFood() {
  try {
    // First, login to get a token
    console.log('Step 1: Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'volunteer@community.com',
      password: 'password123'
    });

    const token = loginResponse.data.data.token;
    const userId = loginResponse.data.data.id;
    console.log('✓ Logged in successfully. Token:', token.substring(0, 20) + '...');

    // Create headers with token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Post food
    console.log('\nStep 2: Posting food...');
    const foodPayload = {
      food_name: 'Test Biryani',
      food_type: 'meals',
      quantity_servings: 8,
      description: 'Fresh biryani from test',
      address: 'Tiruvallur, Tamil Nadu',
      latitude: 13.0827,
      longitude: 80.2707,
      safety_window_minutes: 30,
      min_storage_temp_celsius: 60,
      max_storage_temp_celsius: 4,
      availability_time_hours: 2
    };

    console.log('Payload:', JSON.stringify(foodPayload, null, 2));

    const response = await axios.post(`${API_URL}/food`, foodPayload, { headers });

    console.log('✓ Food posted successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('✗ Error: Cannot connect to backend at http://localhost:5000');
      console.error('Make sure the backend is running with: npm run dev:all');
    } else {
      console.error('✗ Error:', error.response?.data || error.message);
    }
  }
}

testPostFood();
