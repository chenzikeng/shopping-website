const bcrypt = require('bcrypt');

console.log('Password: admin123');
console.log('Hash:', bcrypt.hashSync('admin123', 10));