const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));

const fs = require('fs');

app.post('/submit_registration', (req, res) => {
  // Access form data: req.body.fname, req.body.lname, req.body.address
  const { fname, lname, address } = req.body;
  const entry = `First name: ${fname}, Last name: ${lname}, Address: ${address}\n`;
  fs.appendFile('registrations.txt', entry, (err) => {
    if (err) {
      console.error('Error saving registration:', err);
      return res.status(500).send('Error saving registration');
    }
    res.send('Registration received and saved!');
  });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));