require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// 🛡️ Inicializar conexión VIP con Supabase usando la llave maestra
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middlewares globales
app.use(cors());
app.use(express.json());

// 1. LOGGER MIDDLEWARE
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// 2. RATE LIMITER MIDDLEWARE (Max 10 pings por minuto por IP)
const telemetryLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiadas peticiones. Bloqueado por Rate Limiter.' }
});

// 3. AUTH MIDDLEWARE (Filtro de llave de hardware)
const authHardwareKey = (req, res, next) => {
  const deviceKey = req.headers['x-aura-node-key'];
  if (!deviceKey || deviceKey !== 'AURA_RPI_SECRET_2026') {
    console.warn(`[SECURITY_ALERT] Intento de acceso no autorizado desde IP: ${req.ip}`);
    return res.status(403).json({ error: '[ACCESS_DENIED] Llave de hardware inválida o ausente.' });
  }
  next();
};

// 4. VALIDATOR MIDDLEWARE (Estructura de datos limpia)
const validateTelemetryPayload = (req, res, next) => {
  const { device_id, establishment_id, status } = req.body;
  if (!device_id || !establishment_id || !status) {
    return res.status(400).json({ error: '[BAD_REQUEST] Payload incompleto. Se requiere: device_id, establishment_id y status.' });
  }
  next();
};

// 📡 RUTA DE TELEMETRÍA CONECTADA A SUPABASE
app.post('/api/telemetry/ping', telemetryLimiter, authHardwareKey, validateTelemetryPayload, async (req, res) => {
  const { device_id, establishment_id, status } = req.body;

  try {
    // Inyectar el registro directo a la tabla de Supabase de manera segura
    const { data, error } = await supabase
      .from('profiles') 
      .insert([
        { 
          device_id: device_id, 
          establishment_id: establishment_id, 
          status: status,
          pingED: new Date() 
        }
      ])
      .select();

    if (error) throw error;

    console.log(`📊 [SUPABASE_INSERT] Telemetría guardada con éxito para el dispositivo: ${device_id}`);
    
    res.status(201).json({
      success: true,
      message: 'Telemetría procesada, validada y almacenada en la bóveda.',
      inserteddata: data
    });

  } catch (error) {
    console.error('❌ Error crítico al escribir en Supabase:', error.message);
    res.status(500).json({ error: 'Error interno del servidor al almacenar en la base de datos.' });
  }
});

app.listen(PORT, () => {
  console.log('\n⬛🟩 AURA PLAY: MICROSERVICIO ACTIVO');
  console.log(`📡 Escuchando telemetría segura en puerto ${PORT}\n`);
});