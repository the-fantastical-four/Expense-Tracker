const supabase = require('../../supabaseClient')
const mysql = require('mysql2/promise'); 
const { dbConfig } = require('../../config'); 

const normalizePath = (path) => path.replace(/\\/g, '/');

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
        const [results] = await connection.query(sql, [email]); 
        return results[0].num; 
    }
    catch(error) {
        next(error);
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
        next(error);
    }
    finally {
        await connection.end; 
    }
}

exports.getPass = async function(email) {
    const connection = await mysql.createConnection(dbConfig); 

    try {
        const [results] = await connection.query('SELECT password FROM accounts WHERE email = ?', [email]);
        if(results[0]) {
            return results[0].password;
        }
    } catch (error) {
        next(error);
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
        throw error; 
    }
    finally {
        await connection.end();
    }
}

exports.getAccountEntry = async function(user_id) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        const [results] = await connection.query('SELECT * FROM accounts WHERE user_id = ?', [user_id]); 
        if (results.length > 0) {
            results[0].profile_picture = normalizePath(results[0].profile_picture);
        }
        return results; 
    }
    catch(error) {
        throw error; 
    }
    finally {
        await connection.end();
    }
}


exports.getAllAccounts = async function() {
    const connection = await mysql.createConnection(dbConfig);

    try {
        const [results] = await connection.query('SELECT * FROM accounts');
        return results;
    } catch (error) {
        throw error;
    } finally {
        await connection.end();
    }
}

exports.blacklistIp = async function(ipAddress) {
    const connection = await mysql.createConnection(dbConfig);

    const sql =
        "INSERT INTO " +
        "blacklist (ip) " +
        "VALUES (?)";

    const values = [ipAddress];

    try {
        const [results] = await connection.query(sql, values);
        return results[0];
    } catch (error) {
        throw error;
    } finally {
        await connection.end();
    }
}

exports.isBlacklisted = async function(ipAddress) {
    const connection = await mysql.createConnection(dbConfig);

    const sql =
        "SELECT COUNT(*) as num " +
        "FROM blacklist " +
        "WHERE ip = ?";

    try {
        const [results] = await connection.query(sql, [ipAddress]);
        return results[0].num;
    } catch (error) {
        next(error);
    } finally {
        await connection.end();
    }
}

exports.editUser = async function(user_id, edits) {
    const connection = await mysql.createConnection(dbConfig);

    const sql = 
        "UPDATE accounts " +
        "SET full_name = ?, email = ?, phone_number = ? " + 
        "WHERE user_id = ?"; 

    const values = [edits.full_name, edits.email, edits.phone_number, user_id]

    try {
        const [results] = await connection.query(sql, values);
        return results;
    } catch (error) {
        throw error;
    } finally {
        await connection.end();
    }
}

exports.deleteUser = async function(user_id) {
    const connection = await mysql.createConnection(dbConfig);

    try {
        const [results] = await connection.query('DELETE FROM accounts WHERE user_id = ?', [user_id]);
        return results;
    } catch (error) {
        throw error;
    } finally {
        await connection.end();
    }
}