// logger.js
const fetch = require('node-fetch');

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
}

module.exports = new Logger();
