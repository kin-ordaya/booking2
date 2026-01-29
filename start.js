// Verificar versión de Node.js
console.log('Node.js version:', process.version);

// Polyfill para crypto en caso de que no esté disponible globalmente
const crypto = require('crypto');

if (typeof globalThis.crypto === 'undefined') {
  console.log('⚠️  Applying crypto polyfill...');
  globalThis.crypto = crypto.webcrypto || {
    randomUUID: () => crypto.randomUUID(),
  };
  console.log('✓ Crypto polyfill applied');
} else {
  console.log('✓ Global crypto already available');
}

// Iniciar la aplicación
console.log('🚀 Starting application...');
require('./dist/src/main.js');

