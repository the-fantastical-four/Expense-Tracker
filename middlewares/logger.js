// logger.js
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logs = [];
        this.baseUrl = 'http://localhost:3000'; // Change this to your server's URL if different
    }

    async log(action) {
        this.logs.push(action);
        await this.sendLog(action);
    }

    async sendLog(action) {
        try {
            const response = await fetch('http://localhost:3000/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(action)
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    }

    async logRequest(req, res) {
        const logEntry = req.body;
        const logFilePath = path.join(__dirname, '../logs.json');

        try {
            const data = fs.readFileSync(logFilePath, 'utf8');
            const logs = JSON.parse(data);
            logs.push(logEntry);

            fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2));
            res.status(200).send('Log saved');
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    }
}

module.exports = new Logger();
