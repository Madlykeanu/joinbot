# Minecraft Multi-Bot Manager

This project uses Mineflayer to connect multiple Microsoft accounts to a Minecraft server.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure your settings:
Edit `config.json` and add:
- Your server details (host, port, version)
- Your Microsoft account credentials

3. Run the bot:
```bash
npm start
```

## Features
- Connects 8 Microsoft accounts simultaneously
- Automatic reconnection on disconnect
- Error handling and logging
- Clean shutdown handling

## Configuration
Update the `config.json` file with your server details and account credentials:
```json
{
    "server": {
        "host": "your.server.com",
        "port": 25565,
        "version": "1.20.1"
    },
    "accounts": [
        {
            "username": "email@example.com",
            "password": "yourpassword"
        }
        // Add more accounts...
    ]
}
```

## Security Note
Keep your `config.json` and the `auth` directory private as they contain sensitive information.
