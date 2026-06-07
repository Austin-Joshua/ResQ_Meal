#!/usr/bin/env node
/**
 * Prints dev seed credentials. Never commit real production credentials.
 */
const DEV_PASSWORD = 'ResQ_Dev_2024!';

const accounts = [
  { role: 'Restaurant', email: 'chef@kitchen.com' },
  { role: 'Restaurant', email: 'baker@artisan.com' },
  { role: 'NGO', email: 'ngo@savechildren.com' },
  { role: 'Volunteer', email: 'volunteer@community.com' },
];

console.log('ResQ Meal — dev seed credentials (local only)\n');
console.log(`Password (all accounts): ${DEV_PASSWORD}\n`);
console.log('Emails:');
for (const { role, email } of accounts) {
  console.log(`  ${role.padEnd(12)} ${email}`);
}
console.log('\nNever apply seed.sql to production.');
