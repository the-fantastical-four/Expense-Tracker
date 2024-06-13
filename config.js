module.exports = {
    envPort: process.env.PORT, 
    dbConfig: {
        host: process.env.HOST, 
        user: process.env.DB_USER, 
        password: process.env.DB_PASSWORD, 
        database: process.env.DATABASE
    },
    sessionKey: process.env.SESSION_KEY
}