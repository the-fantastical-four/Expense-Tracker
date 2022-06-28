// import database stuff
const postModel = require("../database/models/Post");
const path = require('path');
const { ObjectId } = require('mongodb');

exports.getAllEntries = function (req, res) {
    postModel.getAllEntries({ user: req.session.email }, function (entries) {
        res.render("index", { entry: entries });
    });
}

// this gets the balance, total expense, and total income 
exports.getTotal = function (req, res) {
    postModel.getAllEntries({ user: req.session.email }, function (entries) {
        res.status(200).send(entries);
    });
}

exports.newEntry = function (req, res) {
    res.render("new-entry", { layout: "no-new-entry" });
}

exports.addExpense = function (req, res) {
    var expense = {
        // entryType is the name attr, and entrytype is id attr in hbs file
        // for some reason if element is a selection, it needs name attribute instead of id
        // if id is used to identify selection, the selection won't be detected in the req.body
        entryType: req.body.entryType,
        date: req.body.date,
        category: req.body.category,
        description: req.body.description,
        amount: req.body.amount,
        notes: req.body.notes,
        ORnumber: req.body.ORnumber,
        user: req.session.email
    }

    postModel.createEntry(expense); 
}

// gets all entries in db that are listed as expenses
exports.getExpenses = function(req, res) {
    const query = {
        entryType: "expense",
        user: req.session.email
    }
    postModel.getAllEntries(query, function(entry) {
        res.render("view-expenses", { expense: entry })
    });
}

// gets all entries in db that are listed as savings 
exports.getSavings = function(req, res) {
    const query = {
        entryType: "savings",
        user: req.session.email
    }
    postModel.getAllEntries(query, function (entry) {
        res.render("view-savings", { saving: entry })
    });
}

exports.login = function (req, res) {
    res.render("login", { layout: "login-layout" });
}

exports.signup = function (req, res) {
    res.render("signup", { layout: "login-layout" });
}

exports.viewAccount = function (req, res) {
    res.render("view-account", { layout: "no-new-entry" });
}

// VIEW ENTRY STUFF
/**
     * Each entry is embedded with its corresponding objectID in the database. 
     * Everytime an entry is clicked, it will lead to this url: /view/entry?id=<entryID here>.
     * req.query.id gets the id from the url and stores it to entryID and this ID is used to create
     * a query in the database for the document with that ObjectID.
     */
exports.viewEntry = function(req, res) {
    var entryID = req.query.id;
    postModel.getById(entryID, function(entry) {
        res.render("view-entry", entry);
    });
}

exports.deleteEntry = function(req, res) {
    var entryID = req.query.id;
    postModel.deleteEntry(entryID, function() {
        res.redirect("/");
    });
}

exports.getEditEntry = function(req, res) {
    var entryID = req.query.id;
    postModel.getById(entryID, function(entry) {
        res.render("edit-entry", entry)
    });
}

exports.confirmEditEntry = function(req, res) {
    var entryID = req.body.id;
    var newEdits = {
        entryType: req.body.entryType,
        date: req.body.date,
        category: req.body.category,
        description: req.body.description,
        amount: req.body.amount,
        notes: req.body.notes,
        ORnumber: req.body.ORnumber
    }

    postModel.editEntry({ _id: ObjectId(entryID) }, { $set: newEdits });
}

exports.search = function(req, res) {
    let expenses = {
        "$or": [
            { entryType: { $regex: req.query.key } },
            { ORnumber: { $regex: req.query.key } },
            { date: { $regex: req.query.key } },
            { description: { $regex: req.query.key } },
            { category: { $regex: req.query.key } }
        ],
        user: req.session.email
    }

    postModel.getAllEntries(expenses, function(result) {
        res.render("search", { expenses: result })
    });
}