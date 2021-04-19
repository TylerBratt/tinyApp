// REQUIRED ITEMS AND FILES
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// SET and USEs enables some exterior code (cookie encryption, body parser, ejs)
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

// HELPER FUNCTIONS relegated to external file to clear server
const {
  generateRandomString,
  findUserByEmail,
  urlsForUser,
  userEmails,
  userCookie,
} = require('./helpers');


// STARTER DATABASES
const urlDatabase = {
  "b2xVn2": {longURL:"http://www.lighthouselabs.ca", userID: 'userID'},
  "9sm5xK": {longURL:"http://www.google.com", userID: 'userID'}
};

const users = {
  userID : {
    id: 'userID',
    email: 'JoeyJoeJoe@Simpsons.com',
    password: bcrypt.hashSync('Shabadoo', saltRounds)
  },
  userID2 : {
    id: 'userID2',
    email: 'MontyBurns@Simpsons.com',
    password: bcrypt.hashSync('Bobo', saltRounds)
  }
};


// URLS PAGE
//Ensures that only logged in users can accesss their homepage
app.get("/urls", (req, res) => {
  if (!userCookie(req.session.userId, users)) {
    res.status(401).send('You must be logged in');
  } else {
    const templateVars = {
      urls: urlsForUser(req.session.userId, urlDatabase),
      user: users[req.session.userId] };
    res.render("urlsIndex", templateVars);
  }
});

// This is the redirection from the :shortULRS page.  When posting to URLs, a random string will be generated and set to a variable that will represent the shortened URL for a certain long form URL
app.post("/urls", (req, res) => {
  if (req.session.userId) {
    const newKey = generateRandomString();
    urlDatabase[newKey] = {
      longURL: req.body.longURL,
      userID: req.session.userId
    };
    res.redirect(`/urls/${newKey}`);
  } else {
    res.status(401).send('You must be logged in');
  }
});

// LOGIN - LOGOUT - REGISTER

//   If a cookie is present, user will be redirected immediately to their homepage
app.get('/login', (req, res) => {
  if (userCookie(req.session.userId, users)) {
    res.redirect('/urls');
  } else {
    const templateVars = {user: users[req.session.userId] };
    res.render('login', templateVars);
  }
});

// entering a valid email address and password from the database will log in user, otherwise they will not gain access to tinyApp.

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  
  if (!userEmails(userEmail, users)) {
    res.status(403).send('No account found with this email');
  } else {
    const userId = findUserByEmail(userEmail, users);
    if (!bcrypt.compareSync(userPassword, users[userId].password)) {
      res.status(403).send('Enter a valid password');
    } else {
      req.session.userId = userId;
      res.redirect('/urls');
    }
  }
});

app.post('/logout', (req,res)=> {
  req.session['userId'] = null;
  res.redirect('/urls');
});

//If cookies are present will redirect user to homepage.

app.get('/register', (req, res)=> {
  if (userCookie(req.session.userId, users)) {
    res.redirect('/urls');
  } else {
    const templateVars = {user: users[req.session.userId] };
    res.render('register', templateVars);
  }
});

// entering an email address and password to the database, will not allow empty fields, or will announce if the account (email) is already taken.

app.post('/register', (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (!userEmail || !userPassword) {
    res.status(400).send('Not a valid email or password');
  } else if (userEmails(userEmail, users)) {
    res.status(400).send('Account is taken');
  } else {
    const password = bcrypt.hashSync(userPassword, saltRounds);
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: userEmail,
      password
    };
    req.session['userId'] = users[userID].id;
    res.redirect('/urls');
  }
});


// NEW
// if no cookies present, will redirect to login page.

app.get("/urls/new", (req, res) => {
  if (!userCookie(req.session.userId, users)) {
    res.redirect('/login');
  } else {
    const templateVars = { user: users[req.session.userId]  };
    res.render("urlsNew", templateVars);
  }
});

// DELETE
// allows user to delete stored short and long URLs
app.post("/urls/:short/delete", (req, res) => {
  if (req.session.userId === urlDatabase[req.params.short].userID) {
    const shortURL = req.params.short;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
  res.status(404).send('You do not have permission to delete this shortURL.  Please login');
});

// INDIVIDUAL SHORT PAGE URL
// displays the individual page of each short URL
app.get("/urls/:shortURL", (req, res) => {
  // if (urlDatabase[req.params.shortURL] !== (req.params.shortURL)) {
  //   res.status(404).send('Cannot find path');
  if (req.session.userId === urlDatabase[req.params.shortURL].userID) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      urlUserID: urlDatabase[req.params.shortURL].id,
      user: users[req.session.userId] };
    res.render("urlsShow", templateVars);
  } else if (urlDatabase[req.params.shortURL] !== (req.params.shortURL)) {
    res.status(404).send('Cannot find path');
  } else {
    res.status(401).send('You do not have permission to access this path. Please login');
  }
});

// allows user to edit the long form URL
app.post("/urls/:shortURL", (req,res) => {

  if (req.session.userId === urlDatabase[req.params.shortURL].userID) {
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect(`/urls`);
  } else {
    res.status(401).send('Not Authorized');
  }
});

// redirects to the users endpoint URL (eg. google.com, etc)
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(404).send('This short URL does not correspond to a long URL in the database');
  }
});

// typing the base path will bring user to the login page
app.get("/", (req, res) => {
  if (userCookie(req.session.userId, users)) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});
// OTHERS

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send(`<html><body><h1>Hello World!</h1></body><!html>\n`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on ${PORT}!`);
});