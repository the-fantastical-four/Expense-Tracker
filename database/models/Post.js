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

// exports.getById = function(id, next) {
//     postModel.findById(id).lean().exec(function(err, result) {
//         if(err) throw err; 
//         next(result); 
//     });
// }

// exports.deleteEntry = function(id, next) {
//     postModel.deleteOne({ _id: id }).exec(function(err, result) {
//         if(err) throw err; 
//         next(result);
//     });
// }

// exports.editEntry = function(id, edits) {
//     postModel.updateOne(id, edits).exec(function(err) {
//         if(err) throw err; 
//     });
// }

// exports.deleteMany = function(id, next) {
//     postModel.deleteMany({ user: id }).exec(function(err, result) {
//         if(err) throw err; 
//         next(result);
//     });
// }