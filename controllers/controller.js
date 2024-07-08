// import database stuff
const postModel = require("../database/models/Post");
const userModel = require("../database/models/User")
const path = require('path');
const { ObjectId } = require('mongodb');

exports.getAllEntries = async function (req, res) {

	try {
		entries = await postModel.getAllEntries(req.session.userId);

		res.render("index", {
			entry: entries
		});
	}
	catch(error) {
		console.log("Could not retrieve entries: ", error); 
		res.redirect("/")
	}
}

exports.getEntry = async function (req, res) {
	try {
		[entry] = await postModel.getById(req.query.id);
		
		if(entry === undefined) {
			throw new Error('Entry does not exist'); 
		}

		res.render("view-entry", entry)
	}
	catch(error) {
		console.log("Could not retrieve entry: ", error); 
		res.redirect("/");
	}
}

exports.login = function (req, res) {
	res.render("login", { layout: "login-layout" });
}

exports.signup = function (req, res) {
	res.render("signup", { layout: "login-layout" });
}

exports.newEntry = function (req, res) {
	res.render("new-entry", { layout: "no-new-entry" })
}

// TODO MAKE SCHEMA 
exports.addEntry = async function(req, res) {

	var entry = {
		// entryType is the name attr, and entrytype is id attr in hbs file
		// for some reason if element is a selection, it needs name attribute instead of id
		// if id is used to identify selection, the selection won't be detected in the req.body
		type: req.body.entryType,
		date: req.body.date,
		category: req.body.category,
		description: req.body.description,
		amount: req.body.amount,
		notes: req.body.notes,
		user: req.session.userId
	}

	try {
		await postModel.createEntry(entry);
		const redirect = '/'; 
		return res.json({
			redirect: redirect
		});
	} catch(error) {
		console.log("Could not create entry: ", error); 
		res.redirect("/")
	}
}

exports.deleteEntry = async function (req, res) {
	var entryID = req.query.id;
	try {
		await postModel.deleteEntry(entryID);
		res.redirect('/'); 
	}
	catch (error) {
		console.log("Could not delete entry: ", error); 
		res.redirect('/'); 
	}
}

exports.getEditEntry = async function (req, res) {
	try {
		[entry] = await postModel.getById(req.query.id);

		if(entry === undefined) {
			throw new Error('Could not find entry'); 
		}

		res.render("edit-entry", entry)
	} catch (error) {
		console.log("Could not retrieve entry: ", error);
		res.redirect("/");
	}
}

exports.confirmEditEntry = async function(req, res) {
    var newEdits = {
        entryType: req.body.entryType,
        date: req.body.date,
        category: req.body.category,
        description: req.body.description,
        amount: req.body.amount,
        notes: req.body.notes
    }

	const entryId = req.body.id; 

    try {
    	await postModel.editEntry(entryId, newEdits);
		const redirect = '/view/entry?id=' + entryId;
		return res.json({
			redirect: redirect
		});
    } catch (error) {
    	console.log("Could not edit entry: ", error);
    	res.redirect("/");
    }
}