module.exports = {
    envPort: process.env.PORT, 
    dbConfig: {
        host: process.env.HOST, 
        user: process.env.USER, 
        password: process.env.PASSWORD, 
        database: process.env.DATABASE
    },
    sessionKey: process.env.SESSION_KEY
}