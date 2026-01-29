// Polyfill para crypto en caso de que no esté disponible globalmente
if (typeof global.crypto === 'undefined') {
  global.crypto = require('crypto').webcrypto;
}

// Iniciar la aplicación
require('./dist/src/main.js');
