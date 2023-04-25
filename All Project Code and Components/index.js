// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.
//const openai = new OpenAIApi(new Configuration({
// apiKey: process.env.API_Key
//}))

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

app.get('/welcome', (req, res) => { //example test case function
  res.json({status: 'success', message: 'Welcome!'});
});

app.get('/', (req, res) => { //default route
  res.redirect('/login'); //this will call the /login route in the API
});

app.get('/login', (req, res) => {
  res.render("pages/login");
});

app.get('/register', (req, res) => {
  res.render("pages/register");
});

app.post('/register', async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 10);
  const values = [req.body.username, hash];
  query = "INSERT INTO users (username, password) VALUES ($1, $2);";
  db.any(query, values)
    .then(function (data) {
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
      res.render("pages/register", { message: "Username taken, try again with a different username" });
    });
});

app.post('/login', async (req, res) => {
  const values = [req.body.username];
  query = "SELECT * FROM users WHERE users.username = $1;";

  db.one(query, values)
    .then(async function (data) {
      const match = await bcrypt.compare(req.body.password, data.password);
      if (match) {
        req.session.user = data;
        req.session.save();
        res.redirect('/home');
      }
      else {
        res.render("pages/login", { message: "Username or password incorrect, please try again" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.render("pages/login", { message: "Username or password incorrect, please try again" });
    });
});

// Authentication Middleware
const auth = (req, res, next) => {
  if (!req.session.user) {
    // Default to login page.
    return res.redirect('/login');
  }
  next();
};

// Authentication Required
app.use(auth);

app.get("/createnewnote", (req, res) => {
  res.render("pages/createnewnote");
})

app.post('/savenote', function (req, res) {
  const query =
    'INSERT INTO entries (entry_title, raw_text) VALUES ($1, $2) RETURNING *;';
  db.any(query, [
    req.body.entry_title,
    req.body.raw_text
  ])
    .then(function (data) {
      res.status(200).json({
        status: 'success',
        data: data,
        message: 'Note added successfully'
      });
    })
    .catch(function (err) {
      console.error(err);
      res.status(400).json({
        status: 'error',
        message: 'An error occurred while saving the note'
      });
    });
});

app.get('/opennote', (req, res) => { 
  // const entryId = req.query['entry-id'];
  var entryId = req.query.id;
  const query = 'SELECT * FROM entries WHERE entry_id = $1'; // SQL query to retrieve entry with correct entry_id
  db.any(query, [entryId])
    .then(function (data) {
      res.render('pages/opennote', {entry: data}); // Pass the 'data' to the 'entry' variable
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while fetching notes',
      });
    });
});


app.get("/createnewjournal", (req, res) => {
  res.render("pages/createnewjournal");
})

app.post('/savejournal', function (req, res) {
  const query =
    'INSERT INTO journals (journal_title, journal_description) VALUES ($1, $2) RETURNING *;';
  db.any(query, [
    req.body.journal_title,
    req.body.journal_description
  ])
    .then(function (data) {
      res.status(200).json({
        status: 'success',
        data: data,
        message: 'Journal added successfully'
      });
    })
    .catch(function (err) {
      console.error(err);
      res.status(400).json({
        status: 'error',
        message: 'An error occurred while saving the journal'
      });
    });
});

app.get('/home', (req, res) => {
  const query = 'SELECT * FROM entries'; // SQL query to retrieve all entries
  db.any(query)
    .then(function (data) {
      res.render('pages/home', {entries: data}); // Pass the 'data' to the 'results' variable
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while fetching notes',
      });
    });
});

app.get('/journal', (req, res) => { 
  const query = 'SELECT * FROM journals'; // SQL query to retrieve all journals
  db.any(query)
    .then(function (data) {
      res.render('pages/journal', {journals: data}); // Pass the 'data' to the 'journals' variable
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while fetching notes',
      });
    });
});
/*app.get('/format', (req, res) => { 
  const query = 'SELECT * FROM journals'; // SQL query to retrieve all journals
  db.any(query)
    .then(function (data) {
      res.render('pages/journal', {journals: data}); // Pass the 'data' to the 'journals' variable
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while trying to format',
      });
    });
});
*/

// Get the entry from the database then ender the edit page with the contents of the entry
app.get('/edit', (req, res) => {
  var id = req.query.id;  // get the ID from the ID query parmater in the URL
  const query = "SELECT * FROM entries where entry_id = $1;"; // SQL query to retrieve all entries
  db.any(query, [id]) 
    .then(function (data) {
      res.render('pages/edit', {results: data}); // Pass the 'data' to the 'results' variable in the home page
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while fetching notes',
      });
    });
});

// Save an edited note - update the text in the database
app.post('/updatenote', function (req, res) {
  const query =
    'UPDATE entries SET entry_title = $1, raw_text = $2 where entry_id = $3;';
  db.any(query, [
  	req.body.title,
    req.body.text,
    req.body.id
  ])
    .then(function (data) {
      res.redirect('/home');   // go to the home page
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while saving the note',
      });
    });
});

// DELETE FROM table_name
//WHERE condition;
// Save an edited note - update the text in the database
app.get('/deletenote', function (req, res) {
  var id = req.query.id;
  const query = 'DELETE FROM entries WHERE entry_id = $1;';
  db.any(query, [id])
    .then(function (data) {
      res.redirect('/home');   // go to the home page
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while deleting the note',
      });
    });
});


app.get('/mood', (req, res) => { 
  res.render("pages/mood");
});

app.get('/profile', (req, res) => { 
  res.render("pages/profile");
});

app.get('/calendar', (req, res) => {
  res.render("pages/calendar");
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/login", { message: "Sucessfully logged out" });
});

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');


