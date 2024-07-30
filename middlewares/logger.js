// logger.js
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const https = require('https')

const agent = new https.Agent({
    rejectUnauthorized: false // Ignores self-signed certificate errors
});

class Logger {
    constructor() {
        this.logs = [];
        this.baseUrl = 'https://localhost:3000'; // Change this to your server's URL if different
    }

    async log(action, next) {
        this.logs.push(action);
        await this.sendLog(action, next);
    }

    async sendLog(action, next) {
        try {
            const response = await fetch('https://localhost:3000/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(action),
                agent: agent
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            next(error); 
        }
    }

    async logRequest(req, res, next) {
        const logEntry = req.body;
        const logFilePath = path.join(__dirname, '../logs.json');

        try {
            if (!fs.existsSync(logFilePath)) {
                // Create the file with an empty array if it doesn't exist
                fs.writeFileSync(logFilePath, JSON.stringify([]));
            }

            const data = fs.readFileSync(logFilePath, 'utf8');
            const logs = JSON.parse(data);
            logs.push(logEntry);

            fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2));
            res.status(200).send('Log saved');
        } catch (error) {
            res.status(500).send('Server error');
            next(error); 
        }
    }
}

module.exports = new Logger();
