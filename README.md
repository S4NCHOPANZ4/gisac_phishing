# Simulador de Phishing

Este proyecto combina un **frontend en React** y un **backend en Node.js con Express y Discord.js** para demostrar, con fines educativos, cómo funcionan los ataques de *phishing*, *keylogging* y *captura de formularios*.

> ⚠️ **Uso exclusivo para aprendizaje.**

---


##  Requisitos

- Node.js v18 o superior  
- npm o yarn  
- Cuenta de Discord y un **bot creado** con su token  
- Un **webhook** de Discord configurado para recibir las notificaciones

---

## Instalación y ejecución

### Backend (Servidor Express)

```bash
cd server
npm install
```

Crea un archivo `.env` dentro de la carpeta `server` con el siguiente contenido:

```bash
DISCORD_BOT_TOKEN=tu_token_de_discord
WEBHOOK_URL=https://discord.com/api/webhooks/tu_webhook
PORT=3001
```

Luego, ejecuta el servidor:

```bash
node server.js
```

El servidor escuchará por defecto en **http://localhost:3001**.

---

### 2️⃣ Frontend (Aplicación React)

```bash
cd client
npm install
npm run dev
```

Esto levantará la aplicación React en **http://localhost:5173**.

---

##  Funcionamiento

###  Frontend (`App.jsx`)
- Simula una página de inicio de sesión legítima con campos de correo y contraseña.
- Integra **Cloudflare Turnstile** como CAPTCHA falso para dar realismo.
- Incluye un **keylogger educativo** que captura las teclas presionadas y las envía al servidor.
- Tras enviar el formulario, muestra una **pantalla educativa** con lecciones de ciberseguridad.

###  Backend (`server.js`)
- Recibe los datos del formulario y los logs del keylogger.
- Envía la información a un **webhook de Discord** para registrar los resultados.
- Implementa un **bot de Discord** que responde al comando `!sendtest`, enviando un mensaje con un botón que dirige a la web simulada (localhost:5173).

---

##  Mini Tutorial: Implementación del Bot de Discord

### Configuración del Bot de Discord

1. Ve al [Portal de Desarrolladores de Discord](https://discord.com/developers/applications)
2. Crea una nueva aplicación
3. Ve a la pestaña **Bot** y presiona **Add Bot**
4. Copia el **TOKEN** del bot (lo usarás en `.env`)
5. En la sección de *Privileged Gateway Intents*, activa:
   -  `MESSAGE CONTENT INTENT`
   -  `SERVER MEMBERS INTENT`
   -  `PRESENCE INTENT`
6. Guarda los cambios.

###  Invitar el Bot a tu Servidor

1. En el menú de la aplicación, entra a **OAuth2 → URL Generator**.
2. Marca los permisos:
   - `bot`
   - `applications.commands`
3. En la sección **Bot Permissions**, selecciona:
   - `Send Messages`
   - `Embed Links`
   - `Read Message History`
4. Copia la URL generada y pégala en tu navegador para invitar el bot a tu servidor.

###  Configuración de Variables de Entorno

Crea un archivo `.env` dentro de la carpeta `server` (o en la raíz si prefieres):

```env
# Bot Discord
DISCORD_BOT_TOKEN=tu_token_del_bot_aqui

# Webhook Discord (opcional)
WEBHOOK_URL=https://discord.com/api/webhooks/tu_webhook_aqui

# Servidor
PORT=3001
```

### Prueba de Funcionamiento

Una vez corras el servidor (`node server.js`), en tu servidor de Discord escribe:

```
!sendtest
```

El bot enviará un mensaje con un botón **“Verificar Ahora”** que redirige al frontend educativo.

---

##  Endpoints principales

| Método | Ruta | Descripción |
|:-------|:------|:------------|
| `POST` | `/api/educational-log` | Registra datos del formulario educativo |
| `POST` | `/api/keylogger-data` | Recibe capturas del keylogger |
| `GET`  | `/` | (Opcional) Página de estado o bienvenida |

---

## Seguridad y ética

Este proyecto está diseñado **solo para propósitos de educación y entrenamiento en seguridad informática**.  

---

 **Tecnologías:** React, Tailwind, Express, Discord.js, Cloudflare Turnstile, Axios



