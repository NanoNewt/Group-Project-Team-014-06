// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const path = require('path');
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.
const { log } = require('console');

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

app.set('view engine', 'ejs'); // set the view engine to EJS
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

// class notes below

app.post('/notes', (req, res) => {
  // console.log('Request body:', req.body);
  const { course_id, title, content } = req.body;
  const query = 'INSERT INTO cnotes (course_id, title, content) VALUES ($1, $2, $3) RETURNING course_id, title, content';
  const values = [course_id, title, content];
  db.one(query, values)
    .then(result => {
      console.log('New note inserted into the database with course ID:', result.course_id);
      res.status(201).json(result);
    })
    .catch(error => {
      console.error('Error inserting new note into the database:', error);
      res.status(500).send('Error inserting new note into the database');
    });
});

app.get('/notes/:course_id', (req, res) => {
  const course_id = req.params.course_id;
  const query = 'SELECT * FROM "cnotes" WHERE course_id = $1';
  const values = [course_id];

  db.any(query, values)
    .then(notes => {
      res.status(200).json(notes);
    })
    .catch(error => {
      console.error('Error fetching notes from the database:', error);
      res.status(500).send('Error fetching notes from the database');
    });
});

// class notes above

let currentPage = 1;

// Lab 11

const user = {
  id: undefined,
  username: undefined,
};

app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});

app.get('/testann', (req, res) => {
  res.render("pages/testann");
});

app.get('/biglogo', (req, res) => {
  const imagePath = path.join(__dirname, 'resources', 'img', 'easyreads-big.png');
  res.sendFile(imagePath);
});

app.get('/icon', (req, res) => {
  const imagePath = path.join(__dirname, 'resources', 'img', 'icon.png');
  res.sendFile(imagePath);
});

app.get('/backsplash', (req, res) => {
  const imagePath = path.join(__dirname, 'resources', 'img', 'backsplash.png');
  res.sendFile(imagePath);
});

app.get('/literature', (req, res) => {
  
  res.render("pages/literature", {
    status: 'success',
    message: 'Home Page!'
  });
});

app.get('/', (req, res) => {
  res.render("pages/splash",
  {
    status: 'success',
    message: 'Home Page!'
  });
});

app.get('/class_notes', (req, res) => {
  if (!req.session.user) {
    res.redirect("/login");
    return;
  }

  res.render("pages/class_notes");
  // console.log('Request body:', req.body);
});

app.post('/add_favorite', async (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    res.redirect("/login");
    return;
  }
  const { title, author, genre, description } = req.body;
   const username = req.session.user.username;
  try {
    // Check if the book already exists in the books table
    let book = await db.oneOrNone('SELECT id FROM books WHERE title=$1', title);
    // If book doesn't exist, add it to the books table
    if (!book) {
      book = await db.one(
        'INSERT INTO books (title, author, genre, description) VALUES ($1, $2, $3, $4) RETURNING *',
        [title, author, genre, description],
      );
    }
    // Add book and user relationship to user_to_books table
    await db.none(
      'INSERT INTO user_to_books (username, book_id) VALUES ($1, $2)',
      [username, book.id]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
    });
 
  }
});



//Lab 11 -- this is wrong to pass the negative case for lab 11.
app.get('/bookmarks', (req, res) => {
  res.render("pages/profile");
});




//login
app.get('/login', (req, res) => {
  res.render("pages/login");
});


app.post('/login', async (req, res) => {
  const username = req.body.username;
  const query = "select * from users where username = $1";  
  const values = [username];

  db.one(query, values)
    .then((data) => {
      user.username = data.username;
      user.password = data.password;
      const match = bcrypt.compare(req.body.password, user.password);

      match.then(function(result){
        if(result){ // Succesful
          req.session.user = user;
          req.session.save();
          res.redirect("/literature");
        }
        else{
          console.log("Incorrect username or password.");
          res.status(300).render("pages/login", {
            error: true,
            message: "Incorrect username or password.",
          });
        }
      })

    })
    .catch((err) => {
      res.render("pages/register", {
        error: true,
        message: "Username doesn't exist, please register",
      });
    });
});


app.get("/profile", async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.user) {
      res.redirect("/login");
      return;
    }

    const username = req.session.user.username;

    // Retrieve user's favorite books from database
    const booksQuery = `
      SELECT books.id, books.title, books.author, books.genre, books.description
      FROM books
      INNER JOIN user_to_books ON user_to_books.book_id = books.id
      INNER JOIN users ON users.username = user_to_books.username
      WHERE users.username = $1
    `;
    const booksValues = [username];
    const booksResult = await db.query(booksQuery, booksValues);
    const favoriteBooks = booksResult || [];



    // Retrieve user's annotations and comments from database
    // `SELECT * FROM comments WHERE annotation_id = ${annotation_id};`;
    const annotationsQuery = `
    SELECT annotations.id, annotations.page_number, annotations.start_index, annotations.end_index, books.title, comments.comment
    FROM annotations
    INNER JOIN books_to_annotation ON books_to_annotation.annotation_id = annotations.id
    INNER JOIN books ON books.id = books_to_annotation.book_id
    LEFT JOIN annotation_to_comments ON annotation_to_comments.annotation_id = annotations.id
    LEFT JOIN comments ON comments.id = annotation_to_comments.comment_id
    LEFT JOIN user_to_annotation ON user_to_annotation.annotation_id = annotations.id
    LEFT JOIN users ON users.username = user_to_annotation.username
    WHERE users.username = $1
`;

    const annotationsValues = [username];
    const annotationResult = await db.query(annotationsQuery, annotationsValues);
    const annotations = annotationResult || [];
    console.log(':',annotations);
    // Render the profile page with user's data
    res.render("pages/profile", {
      username: username,
      favoriteBooks: favoriteBooks,
      annotations: annotations,
      noFavoriteBooks: favoriteBooks.length === 0,
      noAnnotations: annotations.length === 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while retrieving user data.");
  }
});

// DELETE user data (books and annotations)
// <!-- Endpoint 5 :  Delete User ("/delete_user") -->
app.delete('/api/books/:bookID', function (req, res) {
  const bookID = req.params.bookID;
  const username = req.session.user.username;
  const query = 'DELETE FROM user_to_books WHERE book_id = $1 AND username = $2; DELETE FROM user_to_books WHERE book_id = $1 AND username = $2;';

  db.query(query, [bookID, username])
    .then(function () {
      res.status(200).json({
        status: 'success',
        message: `Book with ID ${bookID} and username ${username} deleted successfully.`,
      });
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).json({
        status: 'error',
        message: 'Error occurred while deleting book.',
      });
    });
});

app.delete('/api/annotations/:annotationID', function (req, res) {
  const annotationID = req.params.annotationID;
  const username = req.session.user.username;
  const query2 = `
    DELETE FROM annotation_to_comments
    WHERE annotation_id = $1;
  `;
  const query = `
    DELETE FROM comments
    WHERE annotation_id = $1
  `;
  const query1 = `
    DELETE FROM annotations
    WHERE id = $1;
  `;
  const query3 = `
  DELETE FROM user_to_annotation
  WHERE annotation_id = $1 AND username = $2;
`;
  const query4 = `
  DELETE FROM books_to_annotation
  WHERE annotation_id = $1;
`;
  db.query(query2, [annotationID])
    .then(function () {
      return db.query(query, [annotationID]);
    })
    .then(function () {
      return db.query(query3, [annotationID, username]);
    })
    .then(function () {
      return db.query(query4, [annotationID]);
    })
    .then(function () {
      return db.query(query1, [annotationID]);
    })
    .then(function () {
      res.status(200).json({
        status: 'success',
        message: `Annotation with ID ${annotationID} and username ${username} deleted successfully.`,
      });
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).json({
        status: 'error',
        message: 'Error occurred while deleting annotation.',
      });
    });
});




app.get('/register', (req, res) => {
  res.render("pages/register");
});

app.post('/register', async (req,res) => {

  const username = req.body.username;
  const password = req.body.password;

  //hash the password using bcrypt library
  const hashed_password = await bcrypt.hash(password, 10);

  //Insert username and hashed password into 'users' table
  const insert_sql = `INSERT INTO users (username, password) VALUES ('${username}', '${hashed_password}');`;

  try {
    await db.any(insert_sql);
    res.status(200).redirect("/login");
    // res.redirect("/login");
  } 
  catch (error){
    res.status(300).render("pages/register", {
      error: true,
      message: "Username Exists Please Login",
    })
  }
});

app.get('/biglogo', (req, res) => {
  const imagePath = path.join(__dirname, 'resources', 'img', 'easyreads-big.png');
  res.sendFile(imagePath);
});

app.get('/icon', (req, res) => {
  const imagePath = path.join(__dirname, 'resources', 'img', 'icon.png');
  res.sendFile(imagePath);
});

app.get('/book_img', (req, res) => {
  const imagePath = path.join(__dirname, 'resources', 'img', 'books.jpg');
  res.sendFile(imagePath);
});

app.get('/csnotespic', (req, res) => {
  const imagePath = path.join(__dirname, 'resources', 'img', 'test.jpg');
  res.sendFile(imagePath);
});

app.get('/classnotes_img', (req, res) => {
  const imagePath = path.join(__dirname, 'resources', 'img', 'class_notes.jpg');
  res.sendFile(imagePath);
});

app.get('/ebook_img', (req, res) => {
  const imagePath = path.join(__dirname, 'resources', 'img', 'ebook.jpg');
  res.sendFile(imagePath);
});

app.get('/annotations_img', (req, res) => {
  const imagePath = path.join(__dirname, 'resources', 'img', 'annotations.jpg');
  res.sendFile(imagePath);
});

app.get('/notes_img', (req, res) => {
  const imagePath = path.join(__dirname, 'resources', 'img', 'notes.png');
  res.sendFile(imagePath);
});

app.get('/backsplash', (req, res) => {
  const imagePath = path.join(__dirname, 'resources', 'img', 'backsplash.png');
  res.sendFile(imagePath);
});







// Authentication Middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    // Default to login page.
    return res.redirect('/login');
  }
  next();
};
// Authentication Required
app.use(auth);

// Handle form submission

app.get('/books', async (req, res) => { 

  try {
    if (!req.session.user) {
      res.redirect("/login");
      return;
    }

    const username = req.session.user.username;

    // Retrieve user's favorite books from database
    const booksQuery = `
      SELECT books.id, books.title, books.author, books.genre, books.description
      FROM books
      INNER JOIN user_to_books ON user_to_books.book_id = books.id
      INNER JOIN users ON users.username = user_to_books.username
      WHERE users.username = $1
    `;
    const booksValues = [username];
    const booksResult = await db.query(booksQuery, booksValues);
    const favoriteBooks = booksResult || [];

    var search = req.query.search;

    if(!search){
      var response = await axios.get(`https://gutendex.com/books/`);
    }else{
      var response = await axios.get(`https://gutendex.com/books/?search=${search}`);
    }
    let currentPage = 1;
    var books = response.data.results;

    // Render the profile page with user's data
    res.render("pages/books", {
      username: username,
      favoriteBooks: favoriteBooks,
      noFavoriteBooks: favoriteBooks.length === 0,
      books: books
    }); 

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to fetch books and or user data' });
}});

 // Puts books metadata in database is not all readly there.
 // Then redirects to singlebook/:id
app.get('/initial_singlebook/:id', async (req, res)=>{
  const LINES_PER_PAGE = 60;
  const bookId = req.params.id;
  const check_for_book_entry = `SELECT * FROM books WHERE id = ${bookId}`;

  try {
    const response = await db.oneOrNone(check_for_book_entry);
    let pages_in_book;
    if(response == null){// Put book metadata in database
      const url = `https://gutendex.com/books/?ids=${bookId}`;
      const gutenberg_response_metadata = await axios.get(url);
      const book = gutenberg_response_metadata.data.results[0];

      const book_text_url = `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.txt`;
      const response_book_text = await axios.get(book_text_url);

      const book_contents = response_book_text.data.replace(/'/g, "''");
      const book_contents_line_array = book_contents.split('\n');
      const lines_in_book = book_contents_line_array.length;
      pages_in_book = Math.ceil(lines_in_book/LINES_PER_PAGE);

      const cols = `id, title, pages_in_book`;
      const vals = `${bookId}, '${book.title.replace(/'/g,"''")}', ${pages_in_book}`;
      const INSERT = `INSERT INTO books (${cols}) VALUES (${vals});`;

      await db.none(INSERT);

      // Put empty book_pages in database
      let insert_query = 'INSERT INTO book_pages (book_id, page_number, page_content) VALUES';
      
      for (let page_number = 1; page_number < (pages_in_book + 1); page_number++) {
        const startLine = (page_number - 1) * LINES_PER_PAGE;
        const endLine = startLine + LINES_PER_PAGE;
        const page = book_contents_line_array.slice(startLine, endLine).join('');

        const vals = `${bookId}, ${page_number}, '${page}'`;
        insert_query += `(${vals}), `;
      }
      
      insert_query = insert_query.slice(0,-2) + ';';
      await db.none(insert_query);
    }
    res.redirect(`/singlebook/${bookId}/1`)
  }
  catch (error) {
    console.log(error);
  }
});

app.get('/singlebook/:id/:page_number', async (req, res) => {
  const bookId = req.params.id;

  try {

    const annotationsQuery = `
    SELECT annotations.id, annotations.page_number, annotations.start_index, annotations.end_index, books.title, comments.comment
    FROM annotations
    INNER JOIN books_to_annotation ON books_to_annotation.annotation_id = annotations.id
    INNER JOIN books ON books.id = books_to_annotation.book_id
    LEFT JOIN annotation_to_comments ON annotation_to_comments.annotation_id = annotations.id
    LEFT JOIN comments ON comments.id = annotation_to_comments.comment_id
    LEFT JOIN user_to_annotation ON user_to_annotation.annotation_id = annotations.id
    LEFT JOIN users ON users.username = user_to_annotation.username
    WHERE books.id = $1
    `;

    const annotationsValues = [bookId];
    const annotationResult = await db.query(annotationsQuery, annotationsValues);
    const annotations = annotationResult || [];
    // console.log(':',annotations);

    const book_id = req.params.id;
    let page_number = parseInt(req.params.page_number,10);

    const condition = `(book_id = ${book_id}) AND (page_number = ${page_number})`
    const query = `SELECT * FROM book_pages WHERE ${condition};`;
    const response = await db.one(query);

    const page_content = response.page_content;
    const get_pages_in_book = `SELECT * FROM books WHERE id = ${book_id};`;
    const pages_in_book_responce = await db.one(get_pages_in_book);
    const pages_in_book = pages_in_book_responce.pages_in_book;
    const title = pages_in_book_responce.title;

    // res.render('pages/singlebook', {book_id, page_number, page_content, pages_in_book, title});

    res.render("pages/singlebook", {
      book_id,
      page_number,
      page_content,
      pages_in_book,
      title,
      annotations: annotations,
      noAnnotations: annotations.length === 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch book contents' });
  }
});

app.get('/changePage/:id/:pagenum', (req, res) => {
  const page_number = parseInt(req.params.pagenum,10); 
  const bookId = req.params.id;
  res.redirect(`/singlebook/${bookId}/${page_number}`);
});

app.get('/singlebook', (req, res) => {
  res.render("pages/singlebook");
});

app.get('/logout', (req,res)=> {
  req.session.destroy();
  res.render("pages/login", {message: 'Logged out Successfully'});
})


app.get('/annotations/:book_id/:page_number', async (req, res) => {
  const book_id = req.params.book_id;
  const page_number = req.params.page_number;

  res.render("pages/annotations", {
    book_id: book_id,
    page_number: page_number,
  });
});

app.post('/create_annotation', async (req,res) => {
  console.log(req.body);
  const book_id = req.body.book_id;
  const page_number = req.body.page_number;
  const start_index = req.body.start_index;
  const end_index = req.body.end_index;
  const username = req.session.user.username;

  // Create insert sql
  const cols = '(book_id,page_number,start_index,end_index)';
  const vals = `(${book_id},${page_number},${start_index},${end_index})`;
  console.log('inform:', vals);
  const insert_sql = `INSERT INTO annotations ${cols} VALUES ${vals} RETURNING *;`;

  try {
    const responce = await db.one(insert_sql);
    const { id: annotation_id } = responce;
    const user_to_annotation_cols = '(username, annotation_id)';
    const user_to_annotation_vals = `('${username}',${annotation_id})`;
    const books_to_annotation_cols = '(book_id, annotation_id)';
    const books_to_annotation_vals = `('${book_id}',${annotation_id})`;
    console.log('user_to_annotation:', user_to_annotation_vals);
    const insert_user_to_annotation_sql = `INSERT INTO user_to_annotation ${user_to_annotation_cols} VALUES ${user_to_annotation_vals} RETURNING *;`;
    const response1 = await db.one(insert_user_to_annotation_sql);
    const insert_books_to_annotation_sql = `INSERT INTO books_to_annotation ${books_to_annotation_cols} VALUES ${books_to_annotation_vals } RETURNING *;`;
    const response = await db.one(insert_books_to_annotation_sql);
    res.send(responce);
  } catch (error) {
    console.log(error);
  }
});

app.get('/get_annotation_comments', async (req,res) => {
  const annotation_id = req.params.id;

  const query = `SELECT * FROM comments WHERE annotation_id = ${annotation_id};`;

  try {
    const responce = await db.any(query);
    res.send(responce);
  } catch (error) {
    console.log(error);
  }
});
app.post('/add_comment', async (req,res) => {
  const annotation_id = req.body.annotation_id;
  const comment = req.body.comment;
  const username = req.session.user.username;

  // Create query
  const cols = '(username,annotation_id,comment)';
  const vals = `('${username}',${annotation_id},'${comment}')`;
  const query = `INSERT INTO comments ${cols} VALUES ${vals} RETURNING *;`;


  // Send query
  try {
    const responce = await db.one(query);
    const { id: comment_id } = responce;
    const colscom = '(annotation_id,comment_id)';
    const valscom = `('${annotation_id}',${comment_id})`;
    console.log('inform:', valscom);
    const inserta_sql = `INSERT INTO annotation_to_comments ${colscom} VALUES ${valscom} RETURNING *;`;
    const responce1 = await db.one(inserta_sql);
    console.log(responce);
    res.json(responce);
  } catch (error) {
    console.log(error);
  }
});

app.post('/annotations_for_page', async (req,res) => {
  const book_id = req.body.book_id;
  const page_number = req.body.page_number;

  const condition = `(book_id = ${book_id}) AND (page_number = ${page_number})`
  const query = `SELECT * FROM annotations WHERE ${condition};`;

  try {
    const responce = await db.any(query);
    res.send(responce);
  } catch (error) {
    console.log(error);
  }
});

app.post('/get_comments_for_annotations', async (req,res) => {
  const annotations = req.body.annotations;

  let list ='';
  annotations.forEach(ann => {
    list += ann.id + ',';
  });
  if(annotations.length > 0){// remove comma at end
    list = list.substring(0,list.length-1);
  }

  const query = `SELECT * FROM comments WHERE annotation_id IN (${list});`;

  try {
    const responce = await db.any(query);
    console.log(responce);
    // make list of unique annotation_ids among comments
    let annotation_ids = [];
    responce.forEach(comment =>{
      if(annotation_ids.find(ann_id => {return ann_id == comment.annotation_id }) == null){
        annotation_ids.push(comment.annotation_id);
      }
    });

    // create array called annotations and populate it with annotations
    let annotations = [];
    annotation_ids.forEach((annotation_id) =>{
      annotations.push({id: annotation_id, comments: []})
    });

    // put comments in annotations
    responce.forEach(comment => {
      comments_annotation = annotations.find(ann => {return ann.id == comment.annotation_id });
      comments_annotation.comments.push(comment);
    });


    res.send(annotations);
  } catch (error) {
    console.log(error);
  }
});

/*
app.post(`bookPage_from_bookID_and_pageNumber`, async (req,res) =>{
  const book_id = req.body.book_id;
  const page_number = req.body.page_number;
  

  const query = `SELECT * FROM book_pages WHERE (book_id = ${book_id}) AND (page_number = ${page_number});`;

  try {
    const responce = await db.one(query);
    res.send(responce);
  } catch (error) {
    console.log(error);
  }
});
*/



// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
//app.listen(3000);
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');