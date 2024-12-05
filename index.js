const mineflayer = require('mineflayer');
const config = require('./config.json');

class BotManager {
    constructor() {
        this.bots = new Map();
    }

    createBot(botConfig, index) {
        return new Promise((resolve, reject) => {
            console.log(`Starting bot ${botConfig.name}...`);
            console.log('Please authenticate using the Microsoft code below...');

            const bot = mineflayer.createBot({
                host: config.server.host,
                port: config.server.port,
                version: config.server.version,
                auth: 'microsoft',
                username: botConfig.name
            });

            // Set a timeout in case authentication takes too long
            const timeout = setTimeout(() => {
                bot.end();
                reject(new Error(`Authentication timeout for ${botConfig.name}`));
            }, 300000); // 5 minutes timeout

            bot.once('spawn', () => {
                clearTimeout(timeout);
                console.log(`${botConfig.name} successfully authenticated and spawned!`);
                console.log(`${botConfig.name} sending to earth server...`);
                bot.chat('/server earth');
                this.setupBotEvents(bot, botConfig.name);
                this.bots.set(index, bot);
                resolve(bot);
            });

            bot.on('error', (error) => {
                clearTimeout(timeout);
                console.error(`${botConfig.name} encountered an error:`, error);
                reject(error);
            });

            bot.on('kicked', (reason) => {
                console.log(`${botConfig.name} was kicked:`, reason);
            });
        });
    }

    setupBotEvents(bot, name) {
        bot.on('end', () => {
            console.log(`${name} disconnected. Attempting to reconnect...`);
            const index = Array.from(this.bots.entries())
                .find(([_, b]) => b === bot)?.[0];
            
            if (index !== undefined) {
                setTimeout(() => {
                    this.createBot(config.accounts[index], index)
                        .catch(error => console.error(`Failed to reconnect ${name}:`, error));
                }, 5000);
            }
        });
    }

    async start() {
        console.log('Starting bots sequentially...');
        console.log('Each bot will wait for successful authentication before moving to the next.');
        
        for (let i = 0; i < config.accounts.length; i++) {
            try {
                await this.createBot(config.accounts[i], i);
                console.log(`Bot ${i + 1} setup complete. Moving to next bot...\n`);
                // Add delay before next bot login attempt
                if (i < config.accounts.length - 1) {
                    console.log('Waiting 5 seconds before next login attempt...');
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            } catch (error) {
                console.error(`Failed to start bot ${i + 1}:`, error);
                console.log('Moving to next bot...\n');
            }
        }
        
        console.log('All bots initialization completed!');
    }
}

// Create and start the bot manager
const manager = new BotManager();
manager.start().catch(console.error);

// Handle process termination
process.on('SIGINT', () => {
    console.log('Shutting down bots...');
    manager.bots.forEach(bot => bot.end());
    process.exit();
});
