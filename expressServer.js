// REQUIRED ITEMS AND FILES
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// SET and USEs
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

// HELPER FUNCTIONS
const {
  generateRandomString,
  findUserByEmail,
  urlsForUser,
  userEmails,
  userCookie,
} = require('./helpers');

// DATABASES

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
app.get("/urls", (req, res) => {
  if (!userCookie(req.session.userId, users)) {
    res.redirect('/login');
  } else {
    const templateVars = {
      urls: urlsForUser(req.session.userId, urlDatabase),
      user: users[req.session.userId] };
    res.render("urlsIndex", templateVars);
  }
});


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

app.get('/login', (req, res) => {
  if (userCookie(req.session.userId, users)) {
    res.redirect('/urls');
  } else {
    const templateVars = {user: users[req.session.userId] };
    res.render('login', templateVars);
  }
});

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
  res.redirect('/login');
});

app.get('/register', (req, res)=> {
  if (userCookie(req.session.userId)) {
    res.redirect('/urls');
  } else {
    const templateVars = {user: users[req.session.userId] };
    res.render('register', templateVars);
  }
});

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
app.get("/urls/new", (req, res) => {
  if (!userCookie(req.session.userId, users)) {
    res.redirect('/login');
  } else {
    const templateVars = { user: users[req.session.userId]  };
    res.render("urlsNew", templateVars);
  }
});

// DELETE

app.post("/urls/:short/delete", (req, res) => {
  if (req.session.userId === urlDatabase[req.params.short].userID) {
    const shortURL = req.params.short;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
  res.status(404).send('cannot find path');
});

// INDIVIDUAL SHORT PAGE URL
app.get("/urls/:shortURL", (req, res) => {
  if (req.session.userId === urlDatabase[req.params.shortURL].userID) {

    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      urlUserID: urlDatabase[req.params.shortURL].id,
      user: users[req.session.userId] };
    res.render("urlsShow", templateVars);
  } else {
    res.status(404).send('cannot find path');
  }

});

app.post("/urls/:shortURL", (req,res) => {

  if (req.session.userId === urlDatabase[req.params.shortURL].userID) {
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect(`/urls`);
  } else {
    res.status(401).send('Not Authorized');
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortUrl]) {
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

// OTHERS
app.get("/", (req, res) => {
  if (userCookie(req.session.userId, users)) {
    res.redirect('/urls');
  } else {
    res.redirect('/register');
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send(`<html><body><h1>Hello World!</h1></body><!html>\n`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on ${PORT}!`);
});