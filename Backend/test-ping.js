// test-ping.js: Simulador de la Raspberry Pi Zero 2W
const API_URL = 'http://localhost:5000/api/telemetry/ping';

async function testMiddlewares() {
  console.log("🚀 Iniciando simulación de ataques a los Middlewares...\n");

  // ❌ PRUEBA 1: Sin llave secreta (Debe fallar en el Auth Middleware)
  console.log("▶️ Prueba 1: Intento de conexión sin llave secreta...");
  let res1 = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ device_id: 'RPI-001', establishment_id: 'LOCAL-1', status: 'online' })
  });
  console.log("Resultado 1:", await res1.json(), "\n");

  // ❌ PRUEBA 2: Llave correcta, pero Payload incompleto (Debe fallar en el Validator)
  console.log("▶️ Prueba 2: Llave correcta pero faltan datos del local...");
  let res2 = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-aura-node-key': 'AURA_RPI_SECRET_2026' // Llave correcta
    },
    body: JSON.stringify({ device_id: 'RPI-001' }) // Omite status y establishment_id
  });
  console.log("Resultado 2:", await res2.json(), "\n");

  // ✅ PRUEBA 3: Todo perfecto (Pasa todos los middlewares)
  console.log("▶️ Prueba 3: Ping perfecto desde la Raspberry Pi simulada...");
  let res3 = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-aura-node-key': 'AURA_RPI_SECRET_2026' // Llave correcta
    },
    body: JSON.stringify({ device_id: 'RPI-001', establishment_id: 'LOCAL-1', status: 'online' }) // Payload completo
  });
  console.log("Resultado 3:", await res3.json(), "\n");
}

testMiddlewares();