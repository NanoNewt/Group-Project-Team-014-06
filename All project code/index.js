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
  res.render("pages/literature");
});

// app.get('/books', (req, res) => {
//   res.render("pages/books", {
//     // books: ['b1', 'a1', 'g1'],
//   });
//   // console.log(books);
// });

app.get('/class_notes', (req, res) => {
  res.render("pages/class_notes");
});


app.get('/', (req, res) => {
  res.render("pages/splash",
  {
    status: 'success',
    message: 'Home Page!'
  });
});

//Lab 11 -- this is wrong to pass the negative case for lab 11.
app.get('/bookmarks', (req, res) => {
  res.render("pages/profile");
});


app.get('/singlebook', (req, res) => {
  res.render("pages/singlebook");
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


app.get("/profile", (req, res) => {
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
    WHERE user_to_books.username = $1
  `;
  const booksValues = [username];

  db.query(booksQuery, booksValues)
    .then(result => {
      const favoriteBooks = result.rows || [];

      // Retrieve user's annotations and comments from database
      const annotationsQuery = `
        SELECT annotations.id, annotations.book_id, annotations.page_number, annotations.start_index, annotations.end_index, comments.comment
        FROM annotations
        LEFT JOIN user_to_annotation ON user_to_annotation.annotation_id = annotations.id
        LEFT JOIN annotation_to_comments ON annotation_to_comments.annotation_id = annotations.id
        LEFT JOIN comments ON comments.id = annotation_to_comments.comment_id
        WHERE user_to_annotation.username = $1
      `;
      const annotationsValues = [userId];

      return db.query(annotationsQuery, annotationsValues)
        .then(result => {
          const annotations = result.rows || [];

          // Render the profile page with user's data
          res.render("pages/profile", {
            username: req.session.user.username,
            favoriteBooks: favoriteBooks,
            annotations: annotations,
            noFavoriteBooks: favoriteBooks.length === 0,
            noAnnotations: annotations.length === 0,
          });
        });
    })
    .catch(error => {
      console.error(error);
      res.status(500).send("An error occurred while retrieving user data.");
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
    res.redirect(200, '/login');
  } 
  catch (error){
    res.status(300).render("pages/register", {
      error: true,
      message: "Insertion Error",
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

app.get('/classnotes_img', (req, res) => {
  const imagePath = path.join(__dirname, 'resources', 'img', 'class_notes.jpg');
  res.sendFile(imagePath);
});

app.get('/backsplash', (req, res) => {
  const imagePath = path.join(__dirname, 'resources', 'img', 'backsplash.png');
  res.sendFile(imagePath);
});

// Handle form submission
app.get('/books', async (req, res) => { 

  try {
    //api does not require key
    var search = req.query.search;

    if(!search){
      var response = await axios.get(`https://gutendex.com/books/`);
    }else{
      var response = await axios.get(`https://gutendex.com/books/?search=${search}`);
    }
    
    var books = response.data.results;
    res.render('pages/books', { books }); 

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: 'Failed to fetch books' });
}});

app.get('/singlebook/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    const url = `http://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`;
    const response = await axios.get(url);
    const book = {
      contents: response.data,
      id: bookId
    };

    if (req.query.currentPage) {
      currentPage = parseInt(req.query.currentPage);
    }

    res.render('pages/singlebook', { book, currentPage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch book contents' });
  }
});

app.get('/changePage/:id/:pagenum', (req, res) => {
  currentPage = parseInt(req.params.pagenum, 10);

  if (currentPage < 1) {
    currentPage = 1;
  }
  
  const bookId = req.params.id;
  res.redirect(`/singlebook/${bookId}`);
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

  // Create insert sql
  const cols = '(book_id,page_number,start_index,end_index)';
  const vals = `(${book_id},${page_number},${start_index},${end_index})`;
  const insert_sql = `INSERT INTO annotations ${cols} VALUES ${vals} RETURNING *;`;

  try {
    const responce = await db.one(insert_sql);
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
  const comment_text = req.body.comment_text;
  const username = req.session.user.username;

  // Create query
  const cols = '(username,annotation_id,comment)';
  const vals = `(${username},${annotation_id},${comment_text})`;
  const query = `INSERT INTO annotations ${cols} VALUES ${vals} RETURNING *;`;

  // Send query
  try {
    const responce = await db.one(query);
    console.log(responce);
    res.json(responce);
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