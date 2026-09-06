const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
const isValid = (username) => {
    for (let user of users) {
      if (user.username === username) {
        return false;
      }
    }
    return true;
}

const authenticatedUser = (username, password) => {
    for (let user of users) {
      if (user.username === username && user.password === password) {
        return true;
      }
    }
    return false;
}
regd_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!isValid(username)) {
      return res.status(400).json({ message: "Username already exists" });
    }
  
    users.push({ username, password });
  
    return res.status(200).json({
      message: "User registered successfully"
    });
  });
//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (authenticatedUser(username, password)) {
      const token = jwt.sign({ username: username }, "fingerprint_customer");
  
      return res.status(200).json({
        message: "Login successful",
        token: token
      });
    }
  
    return res.status(401).json({
      message: "Invalid username or password"
    });
});
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user;
    const review = req.body.review;

    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if (!review) {
        return res.status(400).json({
            message: "Review is required"
        });
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review added successfully"
    });
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user;

    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if (!books[isbn].reviews[username]) {
        return res.status(404).json({
            message: "Review not found"
        });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully"
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
