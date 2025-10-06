

let books = [];

function loadBooks() {
  fetch("books.json")
    .then(resp => resp.json())
    .then(data => {
      books = data;
      renderTable();
    })
    .catch(err => {
      console.error("Error loading books.json:", err);
      books = [];
      renderTable();
    });
}

function renderTable() {
  const tbody = document.querySelector("#books-table tbody");
  tbody.innerHTML = "";                     // clear old rows

  books.forEach(book => {
    const tr = document.createElement("tr");

    // create cells for each property
    ["title","author","year","genre"].forEach(prop => {
      const td = document.createElement("td");
      td.textContent = book[prop];
      tr.appendChild(td);
    });



    tbody.appendChild(tr);
  });
}

/* --------------------------------------------------------------
   3️⃣  Validation helpers
   -------------------------------------------------------------- */
function isNonEmpty(str) {
  return str && str.trim().length > 0;
}

function isValidYear(val) {
  const num = Number(val);
  return Number.isInteger(num) && num > 0;
}

/* --------------------------------------------------------------
   4️⃣  Update a book (by exact title match)
   -------------------------------------------------------------- */
function updateBook(title, newAuthor, newYear, newGenre) {
  const idx = books.findIndex(b => b.title === title);
  if (idx === -1) return false; // not found

  // only overwrite fields that are supplied (empty strings mean “no change”)
  if (isNonEmpty(newAuthor)) books[idx].author = newAuthor;
  if (isValidYear(newYear))   books[idx].year   = Number(newYear);
  if (isNonEmpty(newGenre))  books[idx].genre  = newGenre;

  return true;
}

/* --------------------------------------------------------------
   5️⃣  Remove a book (by exact title match)
   -------------------------------------------------------------- */
function removeByTitle(title) {
  const originalLength = books.length;
  books = books.filter(b => b.title !== title);
  return books.length < originalLength; // true if something was removed
}

/* --------------------------------------------------------------
   6️⃣  Wire up UI events
   -------------------------------------------------------------- */
document.getElementById("update-btn").addEventListener("click", () => {
  const title   = document.getElementById("upd-title").value;
  const author  = document.getElementById("upd-author").value;
  const year    = document.getElementById("upd-year").value;
  const genre   = document.getElementById("upd-genre").value;
  const errDiv  = document.getElementById("update-error");
  errDiv.textContent = "";

  // ---- validation ----
  if (!isNonEmpty(title)) {
    errDiv.textContent = "Please enter the exact title of the book you want to update.";
    return;
  }
  if (author && !isNonEmpty(author)) { errDiv.textContent = "Author cannot be blank."; return; }
  if (year && !isValidYear(year))   { errDiv.textContent = "Year must be a positive integer."; return; }
  if (genre && !isNonEmpty(genre))  { errDiv.textContent = "Genre cannot be blank."; return; }

  const success = updateBook(title, author, year, genre);
  if (!success) {
    errDiv.textContent = `No book found with title “${title}”.`;
    return;
  }

  // Send update to backend
  fetch('/update_book', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, author, year, genre })
  })
  .then(res => {
    if (res.status === 404) {
      errDiv.style.color = 'red';
      return res.text().then(msg => { errDiv.textContent = msg; });
    }
    errDiv.style.color = 'green';
    return res.text().then(msg => {
      errDiv.textContent = msg;
      loadBooks(); // reload from backend
    });
  })
  .catch(err => {
    errDiv.style.color = 'red';
    errDiv.textContent = 'Error updating book on server.';
  });
});


document.getElementById("remove-btn").addEventListener("click", () => {
  const title  = document.getElementById("rmv-title").value;
  const errDiv = document.getElementById("remove-error");
  errDiv.textContent = "";

  if (!isNonEmpty(title)) {
    errDiv.textContent = "Enter the exact title of the book to remove.";
    return;
  }

  // Send delete request to backend
  fetch('/delete_book', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  })
  .then(res => {
    if (res.status === 404) {
      errDiv.style.color = 'red';
      return res.text().then(msg => { errDiv.textContent = msg; });
    }
    errDiv.style.color = 'green';
    return res.text().then(msg => {
      errDiv.textContent = msg;
      loadBooks(); // reload from backend
    });
  })
  .catch(err => {
    errDiv.style.color = 'red';
    errDiv.textContent = 'Error deleting book on server.';
  });
});

/* --------------------------------------------------------------
   -------------------------------------------------------------- */
loadBooks();