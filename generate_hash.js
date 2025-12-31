const bcrypt = require('bcrypt');

async function generateHash() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  console.log('admin123的bcrypt哈希值:');
  console.log(hashedPassword);
}

generateHash();