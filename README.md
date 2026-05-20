<img width="312" height="116" alt="image" src="https://github.com/user-attachments/assets/4365154f-049f-4009-b671-b461feeff2a1" />

# 🌌 AURA PLAY - Command Center & AP-Unit Ecosystem

Aura Play es una plataforma integral de señalización digital interactiva y telemetría (Digital Signage & SCADA) diseñada para establecimientos comerciales. El sistema permite la gestión en tiempo real de múltiples pantallas (AP-Units) distribuidas físicamente en un local, controlando su contenido multimedia y monitoreando el estado del hardware de forma remota.

---

## 🏗️ Arquitectura del Sistema

El ecosistema se divide en dos grandes bloques conectados a través de WebSockets en tiempo real:

### 1. Aura Command Center (Frontend Administrativo)
Interfaz web con estética SCADA/Cyberpunk para la gestión centralizada del establecimiento.
* **Sistema de Autenticación Seguro:** Login y registro de nodos administrativos con transacciones protegidas (Blackout Curtain UI) y fallback automático para SuperAdmin.
* **Tactical Grid (Matriz Espacial):** Un plano virtual cuadriculado (CSS Grid) que simula la distribución física del establecimiento (Mesas y Barras). Permite instanciar mobiliario y vincular las AP-Units mediante *Drag & Drop*.
* **Creative Lab:** Módulo de empaquetado donde se construyen las "Recetas" (Campaigns). Genera un payload JSON dinámico soportando layouts complejos (`full`, `split`, `focus`).
* **Orchester (Deployment Center):** Panel de control para ejecutar *Global Pushes*. Inyecta las recetas directamente a la base de datos para que todas las AP-Units asignadas cambien su contenido instantáneamente.

### 2. AP-Unit (Edge Hardware Client)
El software cliente diseñado para ejecutarse en las pantallas físicas del establecimiento.
* **Hardware Target:** Raspberry Pi Zero 2W acoplada a pantallas DSI de 7 pulgadas.
* **Modo Promo (Digital Signage):** Renderizado de contenido visual a prueba de fallos (`KioskSlotRender`). Soporta imágenes de catálogo, textos personalizados, precios y etiquetas flotantes, ajustándose al layout dictado por el *Creative Lab*.
* **Telemetry Engine:** Motor de diagnóstico en segundo plano que transmite el estado de salud del hardware hacia el servidor cada 5 segundos (Temperatura de CPU, Voltaje del Sistema, FPS y Señal Wi-Fi).
* **State Machine:** Transición fluida entre estados (`online`, `promo`, `running/diagnostic`) reaccionando a los comandos del *Orchester* sin necesidad de recargar el navegador local.

---

## 🛠️ Stack Tecnológico

* **Core:** React (con TypeScript)
* **Estilos y UI:** Tailwind CSS, Framer Motion (para transiciones fluidas de UI), Lucide React (Iconografía)
* **Backend y Base de Datos:** Supabase (PostgreSQL)
* **Realtime:** Supabase Channels (Suscripciones a PostgreSQL para actualización de telemetría y redibujado de UI sin latencia).
* **Seguridad:** Supabase Auth + RLS (Row Level Security) activado en tablas críticas.

---

## 🚀 Despliegue Local (Modo Desarrollo)

1. Clonar el repositorio:
   ```bash
   git clone <tu-repositorio>
   cd aura-play


2. Instalación de dependencias
   npm install


3. Configurar variables de entorno. Crea un archivo .env en la raíz del proyecto y agrega tus credenciales de Supabase:
  VITE_SUPABASE_URL=tu_supabase_url
  VITE_SUPABASE_ANON_KEY=tu_anon_key

4.Iniciar el servidor de desarrollo:
  npm run dev

# 📡 Estructura de Datos (Core Tables)

  El sistema depende principalmente de las siguientes tablas en Supabase:

  >profiles: Usuario, establecimiento y contrase;a
  
  >establishments: Locales o franquicias registradas.
  
  >layout_elements: Mobiliario arquitectónico (Mesas, barras) posicionado en el Tactical Grid.
  
  >devices: El inventario de AP-Units físicas (Raspberry Pi Zero 2W). Guarda su status, current_recipe y elemento físico asignado.
  
  >device_telemetry: Tabla de alta escritura (Upsert) que recibe el heartbeat y variables de hardware de cada AP-Unit activa.

# Instrucciones de uso

# 🟢 FASE 1: Inicialización del Nodo (Setup)
Levantar Command Center: Ejecuta npm run dev para desplegar el panel administrativo.

Registro: Registra tu usuario con como el ejemplo: person@xxxx.com y tu password. Avisa al super-admin para que te de de alta en el sistema.

Autenticación: Entra con tus credenciales de Administrador en el LoginModule.

Configuración de Infraestructura:

Ve a la pestaña [Tactical Grid] en el panel izquierdo.

Crea las instancias físicas (ej. MESA 01) haciendo clic en + Añadir Mesa. Esto registrará el mueble en la base de datos.

# 🔵 FASE 2: Provisionamiento de Hardware (AP-Unit)
Vincular Hardware: * Ve a la pestaña [Banco AP-Units].

Arrastra una unidad (ej. UNIT-001) desde el banco y suéltala sobre la MESA 01 que creaste.

Resultado: Supabase vincula el assigned_element_id y asigna coordenadas al dispositivo.

>Iniciar AP-Unit Simulado:

Abre una nueva pestaña en tu navegador con la URL: http://localhost:3000/?mode=apunit

Acción interna: El sistema detecta que está en modo apunit, consulta su estado y cambia a online. Verás la telemetría aparecer arriba. Si el Usuario no tiene nada asignado solo mostrara el APunit más cercano pero sin visualizar contenido si no esta asignado al establecimiento.

# 🟡 FASE 3: Desarrollo de Contenido (Creative Lab)
Diseño de Campaña:

Entra al Creative Lab (el módulo donde seleccionas imágenes y configuras slots).

Selecciona los recursos visuales para tus slots.

Pon nombre, haz clic en [ GUARDAR ]. Esto empaqueta tu diseño en un JSON de alta eficiencia en la base de datos.

Prueba a jugar con las fuentes, tamaños, etiquetas y distribucion de la pantalla. Prueba a subir tus imagenes. Cabe mencionar que los precios aún no se pueden modificar en este momento.

# 🔴 FASE 4: Ejecución (Orchester Deployment)
Despliegue Global:

Entra al Deployment Center (Orchester).

Selecciona la campaña que acabas de guardar.

Haz clic en [ Global Push ].

Mecánica: El Orchester actualiza la columna current_recipe y cambia el status del dispositivo a 'promo'. Las demas opciones en Orchester esta ndeshabilitadas para una segunda fase del proyecto.

# 🚀 FASE 5: Renderizado (AP-Unit Output)
Recepción de Datos:

El socket de la AP-Unit (que está abierto en la segunda pestaña) detecta el cambio de status a 'promo'.

El componente KioskSlotRender interpreta el JSON de la receta.

Resultado final: La imagen se inyecta en el DOM, se aplica el filtro visual y tu contenido aparece en pantalla en tiempo real, desplegandose en modo kiosko y rotando cada cierto tiempo.

Puedes regresar a Tactical Grid, seleccionar el dispositivo asignado y ver live mirroring para saber que es lo que esta desplegando las APUnit.

# 🟡🔵 Registro como Superadmin

Después de recibir el alta del usuario, se crea en al tabla profiles un UUID único.

Se accede a la app con credenciales de Superadmin, y el menú de AURA CENTRAL se desbloquea
<img width="1523" height="868" alt="image" src="https://github.com/user-attachments/assets/465ba29b-bb93-47b2-96de-bec38e6ca7ce" />

El siguiente paso en agregar ADMIN (cliente) o SUPERADMIN (AuraPlay Worker)

En el caso de admin el formulario se despliega así:
<img width="477" height="533" alt="image" src="https://github.com/user-attachments/assets/2388ae40-d40a-4bca-bb73-519679ff7b51" />

Se introduce el UUID creado en profiles, nombre del cliente, nombre del establecimiento, Tier adquirido, Categoria de tu establecimiento, despues da acceso.

Apareceran los datos en la ventana USER ROLE MANAGMENT.
<img width="796" height="472" alt="image" src="https://github.com/user-attachments/assets/60442e68-82bd-489f-a4d1-095f25f40958" />


En la sección de GLOBAL ESTABLISHMENT NETWORK aparecera el establecimiento y su información
<img width="808" height="297" alt="image" src="https://github.com/user-attachments/assets/e392e781-9c59-435b-a2dd-9349a982d651" />


En la sección de HARDWARE INVENTORY & PROVISIONING   se dara de altael APUnit con su UUID unico de cada uno, se selecciona el establecimiento y se da click en PROVISION_UNIT

Podrás ver el tab con el nombre del establecimiento y los dispositivos asignados.
<img width="812" height="467" alt="image" src="https://github.com/user-attachments/assets/ea45234d-d54f-40d9-ae45-b0ef68f18471" />


# TERMINAL PARA DEBUGGING

En la parte del Footer, del lado izquierdo, podras acceder a una terminal 
<img width="577" height="208" alt="image" src="https://github.com/user-attachments/assets/6193c40c-a07f-49a8-8644-0b99f1877bcb" />

Esto con el objetivo de probar endpoints de acuerdo al estandar de SUPABASE.
<img width="732" height="750" alt="image" src="https://github.com/user-attachments/assets/dea76e89-582c-4bdd-a35d-b507572775cf" />

Seleccioans la tabla a consultar y puedes ingresar POST, GET, DELETE Y PATCH(UPDATE)

Este es un ejemplo de GET
<img width="721" height="753" alt="image" src="https://github.com/user-attachments/assets/159783ee-10d3-4e75-93b3-07a4f28f663e" />



# MIDDLEWARES PARA SEGURIDAD UTILIZADOS

>cors() & express.json(): Habilitadores de infraestructura base. Permiten la comunicación segura entre orígenes distintos (Frontend/Backend) y parsean automáticamente los payloads de telemetría a formato JSON legible.

>Logger (Auditoría Pasiva): Un interceptor global que imprime en la consola del servidor un registro detallado de cada petición entrante (Timestamp, Método, URL y Dirección IP de origen) para monitoreo de tráfico en tiempo real.

>Rate Limiter (Escudo Anti-Spam): Limitador de frecuencia configurado para aceptar un máximo de 10 pings por minuto por IP. Previene saturación de red y ataques de denegación de servicio (DDoS) si una AP-Unit pierde el control de su ciclo de transmisión.

>Auth Hardware Key (Filtro Edge): Barrera de seguridad estricta. Intercepta los headers de la petición buscando la llave secreta (x-aura-node-key). Si la petición no proviene de una Raspberry Pi Zero 2W autorizada, el acceso es denegado y registrado como alerta de seguridad.

>Payload Validator (Inspector de Integridad): Analizador estructural que rechaza cualquier paquete de datos malformado. Garantiza que el servidor solo procese payloads que contengan obligatoriamente el device_id, establishment_id y status, manteniendo la base de datos libre de registros corruptos o incompletos.


# 🧪 Herramienta de Simulación: Edge Node Test (test-ping.js)
El script test-ping.js es un entorno de pruebas por consola (CLI) diseñado para emular el comportamiento de una unidad de hardware (Raspberry Pi Zero 2W) y validar la resiliencia del pipeline de seguridad de la API.

Ejecuta tres vectores de estrés secuenciales para comprobar que los middlewares de protección están actuando correctamente:

Prueba de Fuego 1 (Rechazo de Autorización): Simula una conexión desde un origen desconocido omitiendo la llave criptográfica en los headers. Valida que el Auth Middleware bloquee inmediatamente el acceso (Error 403) protegiendo el servidor de dispositivos intrusos.

Prueba de Fuego 2 (Rechazo de Integridad): Inyecta la llave de seguridad correcta, pero envía un paquete de datos malformado o incompleto. Valida que el Payload Validator aborte la operación (Error 400) antes de intentar escribir en Supabase.

Prueba de Fuego 3 (Uplink Exitoso): Emula la transmisión perfecta de una AP-Unit operativa, combinando la llave de hardware validada con un payload JSON íntegro. Comprueba que el servidor autorice el paso y confirme el registro exitoso en la bóveda de datos (Status 201).

# PRUEBAS

Corre ambos archivos en temrinales distintas, primero server.js para habilitar los middlware 
<img width="1146" height="163" alt="image" src="https://github.com/user-attachments/assets/60cea063-364f-4eaa-ae4b-1e0f0e4c7d56" />

y despues el test-ping.js




# 💡 Checklist de Resolución de Problemas (Si algo falla):
¿Pantalla negra con telemetría? El dispositivo está en promo pero la receta no cargó. Ejecuta un nuevo Global Push para forzar la actualización.

¿Aparece "ERROR: NO_HARDWARE_FOUND"? Limpia el caché local de la pestaña de la AP-Unit abriendo la consola (F12) y escribiendo: localStorage.removeItem('aura_active_units'). Luego refresca la página.

¿Cambiaste muebles y no aparecen? Recuerda que agregamos el refresco automático, pero si ves algo raro, cambia de pestaña en el Toolbox y regresa para forzar el re-render de React.
     
