const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    const userExists = users.some(user => user.username === username);
    
    if (userExists) {
      return res.status(409).json({ message: "Username already exists" });
    }
  
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});  

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
      const booksList = await new Promise((resolve, reject) => {
        resolve(books);
      });
      res.status(200).json(booksList);
    } catch (err) {
      res.status(500).json({ message: "Error retrieving books." });
    }
});  

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
      const book = await new Promise((resolve, reject) => {
        if (books[isbn]) {
          resolve(books[isbn]);
        } else {
          reject("Book not found");
        }
      });
      res.status(200).json(book);
    } catch (err) {
      res.status(404).json({ message: err });
    }
});    
  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
      const matchingBooks = await new Promise((resolve) => {
        const booksByAuthor = Object.values(books).filter(book => book.author === author);
        resolve(booksByAuthor);
      });
      res.status(200).json(matchingBooks);
    } catch (err) {
      res.status(500).json({ message: "Error finding books by author." });
    }
});    

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
      const booksByTitle = await new Promise((resolve) => {
        const filteredBooks = Object.values(books).filter(book => book.title === title);
        resolve(filteredBooks);
      });
      res.status(200).json(booksByTitle);
    } catch (err) {
      res.status(500).json({ message: "Error finding books by title." });
    }
});    

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    
    if (book) {
      return res.status(200).json(book.reviews);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
});  

module.exports.general = public_users;
