// REQUIRED
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

const {
  generateRandomString,
  findUserByEmail,
  urlsForUser,
  userEmails,
  userCookie,
  addNewUser,
  authenticateUser
} = require('./helpers');


// STARTING DATABASE
const urlDatabase = {
  "b2xVn2": {longURL:"http://www.lighthouselabs.ca", userID: 'userId'},
  "9sm5xK": {longURL:"http://www.google.com", userID: 'userId'}
};

// USERS DATABASE
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
      userId: users[req.session.userId] };
    res.render("urlsIndex", templateVars);
  }
});

app.post("/urls", (req, res) => {
// this line generates a string and sets it as the key
// and makes it equal to the user entered form input
  if (req.session.userId) {
    const newKey = generateRandomString();
    urlDatabase[newKey] = {
      longURL: req.body.longURL,
      usedId: req.session.userId
    };
    res.redirect(`/urls/${newKey}`);
  } else {
    res.status(401).send('You must be logged in');
  }


  //NEW longUrl now disappears -- changed path in urlsIndex


});

// LOGIN - LOGOUT - REGISTER

app.get('/login', (req, res) => {
  if (userCookie(req.session.userId, users)) {
    res.redirect('/urls');
  } else {
    const templateVars = {userId: req.session.userId};
    res.render('login', templateVars);
  }
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  
  if (!userEmails(userEmail, users)) {
    res.status(403).send('No account found with this email');
  } else {
    const userId = findUserByEmail(userEmail);
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
    const templateVars = {userId: req.session.userId};
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
    const userID = generateRandomString();
    const password = bcrypt.hashSync(userPassword, saltRounds);
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
    const userId = req.session.userId;
    const templateVars = { userId };
    res.render("urlsNew", templateVars);
  }
});

// DELETE
//the path takes a : because it is looking for a variable
// STOP FORGETTING THE '/'!!!!!!!!!
app.post("/urls/:short/delete", (req, res) => {
  // entering the correct path of on object is very important...
  const shortURL = req.params.short;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// INDIVIDUAL SHORT PAGE URL
app.get("/urls/:shortURL", (req, res) => {
  // :shortURL is the vaule that we enter into the browser that leads to a key in the database.
  if (urlDatabase[req.params.shortURL]) {
    const userId = req.session.userId;
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL],
      urlUserID: urlDatabase[req.params.shortURL].id,
      userId };
    res.render("urlsShow", templateVars);
  } else {
    res.status(404).send('cannot find path');
  }

});

app.post("/urls/:shortURL/edit", (req,res) => {
  // const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  const templateVars = {userId: req.session.userId};
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`, templateVars);
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