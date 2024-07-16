const mysql = require('mysql2/promise');
const {
    dbConfig
} = require('../../config');

exports.getAllEntries = async function(userId) {
    const connection = await mysql.createConnection(dbConfig);

    try {
        const [results] = await connection.query('SELECT * FROM posts WHERE user_id = ?', [userId]);
        return results;
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await connection.end();
    }
}


// TODO MAKE QUERY 
exports.createEntry = async function(entry) {
    const connection = await mysql.createConnection(dbConfig);
    const {
        type,
        date,
        category,
        description,
        amount, 
        notes,
        user
    } = entry;

    const sql =
        "INSERT INTO " +
        "posts (type, date, category, description, amount, notes, user_id) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?)";

    const values = [type, date, category, description, amount, notes, user];

    try {
        const [results] = await connection.query(sql, values);
        return [results];
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        await connection.end();
    }
}

exports.getById = async function(postId, userId) {
    const connection = await mysql.createConnection(dbConfig);

    const sql = 'SELECT * FROM posts WHERE post_id = ? AND user_id = ?'
    const values = [postId, userId]

    try {
        const [results] = await connection.query(sql, values);
        return results;
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await connection.end();
    }
}

exports.deleteEntry = async function(postId, userId) {
    const connection = await mysql.createConnection(dbConfig);

    try {
        const [results] = await connection.query('DELETE FROM posts WHERE post_id = ? AND user_id = ?', [postId, userId]);
        return results;
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await connection.end();
    }
}

exports.editEntry = async function(postId, userId, edits) {
    const connection = await mysql.createConnection(dbConfig);

    const sql = 
        "UPDATE posts " +
        "SET type = ?, date = ?, category = ?, description = ?, amount = ?, notes = ? " + 
        "WHERE post_id = ? " + 
        "AND user_id = ?"; 

    const values = [edits.entryType, edits.date, edits.category, edits.description, edits.amount, edits.notes, postId, userId]

    try {
        const [results] = await connection.query(sql, values);
        return results;
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await connection.end();
    }
}