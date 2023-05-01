// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server

const {Configuration, OpenAIApi} = require("openai");

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

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

//console.log(process.env.OPENAI_API_KEY);

const openai = new OpenAIApi(configuration);

app.use('/images', express.static('resources/images'));
app.use('/styles', express.static('resources/css'));
//app.use('/modal', express.static('));

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

// async function runCompletion() {
//   const completion = await openai.createCompletion({
//     model: "text-davinci-003",
//     prompt: "Hi ChatGPT how are you today?",
//   });

//   console.log(completion.data.choices[0].text);
// }

// runCompletion();

// adding test user
(async () => {
  try {
    const hashedPassword = await bcrypt.hash('password', 10);
    await db.none('INSERT INTO users (username, password) VALUES ($1, $2)', ['username', hashedPassword]);
  } catch (err) {
    console.error(err);
  }
})();

// async function insertData() {
//   try {
//     const {id} = await db.one('SELECT user_id FROM users WHERE username = $1', ['username']);
//     await db.none("INSERT INTO journals (journal_title, journal_description, user_id) VALUES ($1, $2, $3)", ['Journal 1', 'This is my first journal', id]);
//   } catch (err) {
//     console.error(err);
//   }
// }
// insertData().then(() => {
//   console.log('Data inserted successfully');
// }).catch((err) => {
//   console.error(err);
// });

app.post('/format', async function (req, res) { //async function to await for ChatGPT reply
  const { raw_text, entry_id } = req.body; //seperates data
  
  const prompt = `Format the following text using punctuation, capitalization, spacing, and paragraph breaks where appropriate. Correct grammar, typos, and misspellings. Do not remove or add any words. Reply only with the formatted version of the text:\n\n${raw_text}`;
  
  const completion = await openai.createCompletion({ //createCompletion is a OpenAI keyword to complete a prompt, await for ChatGPT reply
    model: "text-davinci-003", //text model being used
    prompt: prompt, //prompt set above
    max_tokens: 2048, //max number of word chunks in a single output
    n: 1, //max number of outputs (only need one)
  });

  const formatted_text = completion.data.choices[0].text; //pulling out the text of the first choice from data from completion object
  
  const updateQuery = 'UPDATE entries SET raw_text = $1 where entry_id = $2;'; //update entry content
  db.any(updateQuery, [formatted_text, entry_id])
    .then(function(data){
      res.status(200).json({
        status: 'success',
        data: data,
        message: 'Note formatted successfully'
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

app.post('/summarize', async function (req, res) { //async function to await for ChatGPT reply
  const { raw_text, entry_id } = req.body; //seperates data
  
  const prompt = `Summarize the following text while still communicating all the ideas present in the text. Maintain the same style in the summary. Reply with the summarized version of the text, do not include a title:\n\n${raw_text}`;
  
  const completion = await openai.createCompletion({ //createCompletion is a OpenAI keyword to complete a prompt, await for ChatGPT reply
    model: "text-davinci-003", //text model being used
    prompt: prompt, //prompt set above
    max_tokens: 2048, //max number of word chunks in a single output
    n: 1, //max number of outputs (only need one)
  });

  const summarized_text = completion.data.choices[0].text; //pulling out the text of the first choice from data from completion object
  
  const updateQuery = 'UPDATE entries SET raw_text = $1 where entry_id = $2;'; //update entry content
  db.any(updateQuery, [summarized_text, entry_id])
    .then(function(data){
      res.status(200).json({
        status: 'success',
        data: data,
        message: 'Note summarized successfully'
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

app.get('/welcome', (req, res) => { //example test case function
  res.json({status: 'success', message: 'Welcome!'});
});

app.get('/', (req, res) => { //default route
  res.redirect('/launch'); //this will call the /login route in the API
});

app.get('/launch', (req, res) => {
  res.render("pages/launch");
});

app.get('/login', (req, res) => {
  res.render("pages/login");
});

app.get('/register', (req, res) => {
  res.render("pages/register");
});

// app.get('/home', (req, res) => {
//   res.render("pages/home");
// })

app.post('/register', async (req, res) => {

  const username = req.body.username;
  const password = req.body.password;
  const confirm_password = req.body.confirm_password;

  const check_user = 'SELECT * FROM users WHERE username = $1';
  const result = await db.any(check_user, [username]);

  const insert = "INSERT INTO users (username, password) VALUES ($1, $2)";

  if (result.length == 0) {
    if (password == confirm_password) {
      const hash = await bcrypt.hash(password, 10);
      db.any(insert, [username, hash])
      .then(function (data) {
        // req.session.user = data;
        // req.session.save();
        // res.redirect('/home');
        res.render("pages/login", {message: 'Welcome to MindScribe!'});
      })
      .catch((err) => {
        res.render("pages/register", {message: 'Could not create account'});
      });
    } else {
      res.render("pages/register", {message: 'Passwords do not match'});
    }
  } else {
    res.render("pages/register", {message: 'Username already in use'});
  }

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
        res.render("pages/login", { message: "Incorrect username or password" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.render("pages/login", { message: "Incorrect username or password" });
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

app.get('/createnewnote', function (req, res) {
  const query =
    'SELECT * FROM journals WHERE user_id = $1;';
  db.any(query, [req.session.user.user_id])
    .then(function (data) {
      res.render('pages/createnewnote', {
        journals: data
      });
    })
    .catch(function (err) {
      console.error(err);
      res.status(400).json({
        status: 'error',
        message: 'An error occurred while creating a new note'
      });
    });
});

app.post('/savenote', async function (req, res) {
  const {title, rawText, journalId} = req.body;
  const userId = req.session.user.user_id;
  const query = 'INSERT INTO entries (entry_title, raw_text, user_id, journal_id, date, time) VALUES ($1, $2, $3, $4, to_char(CURRENT_TIMESTAMP AT TIME ZONE \'MDT\', \'MM/DD/YYYY\'), to_char(CURRENT_TIMESTAMP AT TIME ZONE \'MDT\', \'HH24:MI\')) RETURNING entry_id;';
  const prompt = `Given the following text give me a number 1-5 that represents the mood of the writing with 1 being very sad and 5 being very happy. Only return a digit 1-5 and nothing else: ${rawText}`;
  const completion = await openai.createCompletion({ //createCompletion is a OpenAI keyword to complete a prompt, await for ChatGPT reply
    model: "text-davinci-003", //text model being used
    prompt: prompt, //prompt set above
    max_tokens: 2048, //max number of word chunks in a single output
    n: 1, //max number of outputs (only need one)
    stop: null,
  });
  const mood_num = parseInt(completion.data.choices[0].text.trim());
  const updateQuery = 'UPDATE entries SET entry_mood = $1 WHERE entry_id = $2;'; //update entry content
  let autoMood = false;
  console.log(journalId);
  if (journalId) {
    const journalAutoQuery = await db.any('SELECT auto_mood AS auto FROM journals WHERE journals.journal_id = $1', [journalId]);
    autoMood = journalAutoQuery[0].auto;
  }
  db.any(query, [
    title,
    rawText,
    userId,
    journalId
  ])
    .then(function (data) {
      if (autoMood) {
        db.any(updateQuery, [mood_num, data[0].entry_id])
        .then(function(data){
          res.status(200).json({
            status: 'success',
            data: data,
            message: mood_num
          });
        })
        .catch(function (err) {
          console.error(err);
          res.status(400).json({
            status: 'error',
            message: 'An error occurred while getting mood num'
          });
        });
      }
    })
    .catch(function (err) {
      console.error(err);
      res.status(400).json({
        status: 'error',
        message: 'An error occurred while saving the note'
      });
    });
});

// app.post('/getmood', async function (req, res) {
//   const {text, id } = req.body;
//   const prompt = `Given the following text give me a only number 1-5 that represents the mood of the writing with 1 being very sad and 5 being very happy: ${text}`;
//   const completion = await openai.createCompletion({ //createCompletion is a OpenAI keyword to complete a prompt, await for ChatGPT reply
//     model: "text-davinci-003", //text model being used
//     prompt: prompt, //prompt set above
//     max_tokens: 2048, //max number of word chunks in a single output
//     n: 1, //max number of outputs (only need one)
//   });
//   const mood_num = parseInt(completion.data.choices[0].text);
//   const updateQuery = 'UPDATE entries SET entry_mood = $1 where entry_id = $2;'; //update entry content
//   db.any(updateQuery, [mood_num, id])
//     .then(function(data){
//       res.status(200).json({
//         status: 'success',
//         data: data,
//         message: mood_num
//       });
//     })
//     .catch(function (err) {
//       console.error(err);
//       res.status(400).json({
//         status: 'error',
//         message: 'An error occurred while saving the note'
//       });
//     });
// });

app.get('/opennote', (req, res) => { 
  const entryId = req.query['entry-id'];
  const query = 'SELECT entries.*, journals.journal_title FROM entries LEFT JOIN journals ON entries.journal_id = journals.journal_id WHERE entries.entry_id = $1 AND entries.user_id = $2'; 
  // SQL query to retrive journal info from correct entry_id, LEFT JOIN for entries without a journal_id
  db.any(query, [entryId, req.session.user.user_id])
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

app.get('/openjournal', (req, res) => { 
  // Fetch query parameters from the request object
  var journal = req.query['journal-id'];
  var userId = req.session.user.user_id

  // Multiple queries using templated strings
  var current_journal = `select * from journals where journal_id = '${journal}' AND user_id = '${userId}';`;
  var entries = `select * from entries where journal_id = '${journal}' AND user_id = '${userId}';`;

  db.task('get-data', task => {
    return task.batch([task.one(current_journal), task.any(entries)]);
  })
  .then(function (data) {
    res.render('pages/openjournal', {
      journal: data[0],
      entries: data[1],
      });
  })
  .catch(function (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching journal',
    });
  });
});

app.get("/createnewjournal", (req, res) => {
  res.render("pages/createnewjournal");
})

app.post('/savejournal', function (req, res) {
  const {journal_title, journal_description, auto_mood} = req.body;
  console.log(auto_mood);
  const query =
    'INSERT INTO journals (journal_title, journal_description, user_id, auto_mood) VALUES ($1, $2, $3, $4) RETURNING *;';
  db.any(query, [
    journal_title, 
    journal_description,
    req.session.user.user_id,
    auto_mood
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

app.get('/notes', (req, res) => {
  const query = 'SELECT * FROM entries WHERE entries.user_id = $1;'; // SQL query to retrieve all entries with current session username
  const userId = req.session.user.user_id;
  db.any(query, [req.session.user.user_id])
    .then(function (data) {
      res.render('pages/notes', {entries: data, id: userId}); // Pass the 'data' to the 'entries' variable
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while fetching entries',
      });
    });
});

app.get('/journal', (req, res) => { 
  const query = `SELECT * FROM journals WHERE journals.user_id = $1;`; // SQL query to retrieve all journals with current session username
  db.any(query, [req.session.user.user_id])
    .then(function (data) {
      res.render('pages/journal', {journals: data}); // Pass the 'data' to the 'journals' variable
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while fetching journals',
      });
    });
});

// Get the entry from the database then enter the edit page with the contents of the entry
app.get('/edit', (req, res) => {
  var id = req.query.id;  // get the ID from the ID query parmater in the URL
  const entryQuery = 'SELECT entries.*, journals.journal_title FROM entries LEFT JOIN journals ON entries.journal_id = journals.journal_id WHERE entries.entry_id = $1';
  const journalQuery = 'SELECT * FROM journals WHERE user_id = $1;';
  db.task(function (t) {
    return t.batch([
      t.any(entryQuery, [id]), // execute the entryQuery and pass the entry_id parameter
      t.any(journalQuery, [req.session.user.user_id]), // execute the journalQuery
    ]);
  })
    .then(function (data) {
      res.render('pages/edit', {results: data[0], journals: data[1]}); // Pass the 'data' to the 'results' variable and 'journals' to the 'journals' variable
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while fetching notes',
      });
    });
});


// Get the journal entry from the database then enter the edit journal page with the contents of the journal
app.get('/editjournal', (req, res) => {
  var id = req.query.id;  // get the ID from the ID query parmater in the URL
  const query = "SELECT * FROM journals where journal_id = $1 AND user_id = $2;"; // SQL query to retrieve all entries
  db.any(query, [id, req.session.user.user_id]) 
    .then(function (data) {
      res.render('pages/editjournal', {results: data}); // Pass the 'data' to the 'results' variable in the home page
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
  const journalQuery = 'SELECT * FROM journals WHERE journals.journal_title = $1 AND user_id = $2;';
  const noJournalQuery = 'UPDATE entries SET entry_title = $1, raw_text = $2, journal_id = null, date = to_char(CURRENT_TIMESTAMP AT TIME ZONE \'MDT\', \'MM/DD/YYYY\'), time = to_char(CURRENT_TIMESTAMP AT TIME ZONE \'MDT\', \'HH24:MI\') where entry_id = $3;';
  const updateQuery = 'UPDATE entries SET entry_title = $1, raw_text = $2, journal_id = $3, date = to_char(CURRENT_TIMESTAMP AT TIME ZONE \'MDT\', \'MM/DD/YYYY\'), time = to_char(CURRENT_TIMESTAMP AT TIME ZONE \'MDT\', \'HH24:MI\') where entry_id = $4;';
  if(req.body.journal_title != "No Journal") {
  db.one(journalQuery, [
    req.body.journal_title,
    req.session.user.user_id
  ])
  .then(function (data){
    db.any(updateQuery, [
      req.body.title,
      req.body.text,
      data.journal_id,
      req.body.id
    ])
  })
    .then(function (data) {
      res.redirect('/notes');   // go to the home page
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while saving the note',
      });
    })
  }
  else {
      db.any(noJournalQuery, [
        req.body.title,
        req.body.text,
        req.body.id
      ])
      .then(function (data) {
        res.redirect('/notes');   // go to the home page
      })
      .catch(function (err) {
        console.error(err);
        res.status(500).json({
          status: 'error',
          message: 'An error occurred while saving the note',
        });
      });
  }
});

// Save an edited note - update the text in the database
app.post('/updatejournal', function (req, res) {
  const query =
    'UPDATE journals SET journal_title = $1, journal_description = $2 where journal_id = $3;';
  db.any(query, [
  	req.body.title,
    req.body.description,
    req.body.id
  ])
    .then(function (data) {
      res.redirect('/journal');   // go to the home page
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while updating the journal',
      });
    });
});

// Save an edited note - update the text in the database
app.get('/deletenote', function (req, res) {
  var id = req.query.id;
  const query = 'DELETE FROM entries WHERE entry_id = $1;';
  db.any(query, [id])
    .then(function (data) {
      res.redirect('/notes');   // go to the home page
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while deleting the note',
      });
    });
});

app.get('/deletejournal', function (req, res) { //delete journal
  var id = req.query.id;
  const updateQuery ='UPDATE entries SET journal_id = null WHERE journal_id = $1;';
  const deleteQuery ='DELETE FROM journals WHERE journal_id = $1;';
  db.task(async (t) => {
    await t.none(updateQuery, [id]); // Update all entries with journal_id = null
    await t.none(deleteQuery, [id]); // Delete journal
    res.redirect('/journal'); // Redirect to journal page
  })
    .catch(function (err) {
      console.error(err);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while deleting the journal',
      });
    });
});

app.get('/mood', (req, res) => { 
  res.render("pages/mood");
});

app.get('/home', async (req, res) => {
  const userId = req.session.user.user_id;
  const username = req.session.user.username;
  try {
    const hourQuery = await db.any('SELECT TO_CHAR(CURRENT_TIMESTAMP AT TIME ZONE \'MDT\', \'HH24\') as curr_hour');
    const hour = parseInt(hourQuery[0].curr_hour);
    const journalCountQuery = await db.any('SELECT * FROM journals WHERE user_id = $1',[userId]);
    const numJournals = journalCountQuery.length;
    const entryCountQuery = await db.any('SELECT * FROM entries WHERE user_id = $1',[userId]);
    const numEntries = entryCountQuery.length;
    const wordCountQuery = await db.any('SELECT SUM(ARRAY_LENGTH(REGEXP_SPLIT_TO_ARRAY(raw_text, \'\\s+\'), 1)) AS words FROM entries WHERE user_id = $1',[userId]);
    let numWords = wordCountQuery[0].words;
    if (numWords == null) {
      numWords = 0;
    }
    const charCountQuery = await db.any('SELECT SUM(LENGTH(raw_text)) AS chars FROM entries WHERE user_id = $1',[userId]);
    let numChars = charCountQuery[0].chars;
    if (numChars == null) {
      numChars = 0;
    }
    res.render("pages/home", { name: username, journal_count: numJournals, entry_count: numEntries, word_count: numWords, char_count: numChars, current_hour: hour });
  } catch (error) {
    console.error('Error getting journal count', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/profile', (req, res) => {
  res.render("pages/profile");
});

app.post('/changeusername', async (req,res) => {
  const id = req.session.user.user_id;
  const new_username = req.body.new_username;
  const query = 'UPDATE users SET username = $1 WHERE user_id = $2';
  try {
    const result = await db.query(query, [new_username, id]);
    res.render("pages/profile", {message: 'Username updated successfully.'});
  } catch (err) {
    console.error(err);
    res.render("pages/profile", {message: 'Error updating username.'});
  }
});

app.post('/changepassword', async (req,res) => {
  const id = req.session.user.user_id;
  const new_password = req.body.new_password;
  const confirm_new_password = req.body.confirm_new_password;
  const query = 'UPDATE users SET password = $1 WHERE user_id = $2';
  if (new_password == confirm_new_password) {
    const hash = await bcrypt.hash(new_password, 10);
    try {
      const result = await db.query(query, [hash, id]);
      res.render("pages/profile", {message: 'Password updated successfully.'});
    } catch (err) {
      console.error(err);
      res.render("pages/profile", {message: 'Error updating password.'});
    }
  } else {
    res.render("pages/profile", {message: 'Passwords do not match.'});
  }
});

app.get('/calendar', (req, res) => {
  res.render("pages/calendar");
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/launch", { message: "Sucessfully logged out" });
});

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');