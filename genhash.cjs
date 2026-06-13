const bcrypt = require('bcryptjs');

const passwords = [
  { label: 'Admin',  password: 'Admin1234!'  },
  { label: 'Client', password: 'Client1234!' },
];

Promise.all(
  passwords.map(async ({ label, password }) => {
    const hash = await bcrypt.hash(password, 10);
    console.log(`${label} → ${hash}`);
  })
).then(() => process.exit(0));