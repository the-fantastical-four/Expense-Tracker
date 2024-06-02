const supabase = require('../../supabaseClient')
const mysql = require('mysql2/promise'); 
const { dbConfig } = require('../../config'); 

exports.createUser = async function (data) {
    const connection = await mysql.createConnection(dbConfig);
    const {
        email, 
        password, 
        full_name, 
        phone_number, 
        profile_picture
    } = data; 

    const sql = 
        "INSERT INTO " + 
        "accounts (email, password, full_name, phone_number, profile_picture) " + 
        "VALUES (?, ?, ?, ?, ?)"; 

    const values = [email, password, full_name, phone_number, profile_picture]; 

    try {
        const [results] = await connection.query(sql, values); 
        return [results]; 
    }
    catch(error) {
        console.error(error); 
        throw error; 
    }
    finally {
        await connection.end();
    }
    
}

exports.checkEmailExists = async function (email) {
    const connection = await mysql.createConnection(dbConfig);
    
    const sql = 
        "SELECT COUNT(*) as num " + 
        "FROM accounts " + 
        "WHERE email = ?"; 

    try {
        const [results] = await connection.query(sql, email); 
        console.log(results[0].num);
        return results[0].num; 
    }
    catch(error) {
        console.error(error); 
        throw error; 
    }
    finally {
        await connection.end(); 
    }
}

exports.getRole = async function(id) {
    const connection = await mysql.createConnection(dbConfig); 

    try {
        const [results] = await connection.query('SELECT role FROM roles WHERE user_id = ?', [id]); 
        return results[0].role; 
    }
    catch (error) {
        console.error(error); 
        throw error; 
    }
    finally {
        await connection.end; 
    }
}

exports.getPass = async function(email) {
    const connection = await mysql.createConnection(dbConfig); 

    try {
        const [results] = await connection.query('SELECT password FROM accounts WHERE email = ?', [email]);
        return results[0].password;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        await connection.end();
    }
}

exports.getAccountId = async function(email) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        const [results] = await connection.query('SELECT user_id FROM accounts WHERE email = ?', [email]); 
        return results[0].user_id; 
    }
    catch(error) {
        console.log(error); 
        throw error; 
    }
    finally {
        await connection.end();
    }
}

exports.getAllAccounts = async function() {
    
}