const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname)); // Serve static files

// Delete book by title
app.delete('/delete_book', (req, res) => {
  const { title } = req.body;
  const filePath = path.join(__dirname, 'books.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error reading books.json');
    let books = JSON.parse(data);
    const newBooks = books.filter(b => b.title !== title);
  if (newBooks.length === books.length) return res.status(404).send('Book not found');

    fs.writeFile(filePath, JSON.stringify(newBooks, null, 2), err => {
      if (err) return res.status(500).send('Error writing books.json');
      res.send('Book deleted successfully');
    });
  });
});

// Update book info by title
app.put('/update_book', (req, res) => {
  const { title, author, year, genre } = req.body;
  const filePath = path.join(__dirname, 'books.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error reading books.json');
    let books = JSON.parse(data);
    const idx = books.findIndex(b => b.title === title);
  if (idx === -1) return res.status(404).send('<span style=color:red> Book not found </span>');

    if (author) books[idx].author = author;
    if (year) books[idx].year = year;
    if (genre) books[idx].genre = genre;

    fs.writeFile(filePath, JSON.stringify(books, null, 2), err => {
      if (err) return res.status(500).send('Error writing books.json');
      res.send('Book updated successfully');
    });
  });
});

app.listen(PORT, () => {
  console.log(`BookManager API running at http://localhost:${PORT}`);
});
