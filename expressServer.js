// REQUIRED
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const session = require('cookie-session');
const { response } = require("express");
const bcrypt = require('bcrypt');
const saltRounds = 10;

// SET and USEs
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// GENERATE THE 6 DIGIT SHORL URL
const generateRandomString = () => {
  const newKey = Math.random().toString(36).substring(2,8);
  return newKey;
};

// MORE FUNCTIONS

const findUserByEmail = email => {
  for (const greaterKey in users) {
    const lesserObj = users[greaterKey];
    const userEmail = lesserObj.email;
    if (userEmail === email) {
      return lesserObj.id;
    }
  }
};

const validateLogin = (email, password) => {
  if (!users[email]) {
    return {error:'userEmail already registered', data:null};
  }
  if (users[email].password === password) {
    return {error:null, data:users[email]};
  } else {
    return {error:"bad password", data:null};
  }
};

const urlsForUser = (userID) => {
  const result = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === userID) {
      result[url] = urlDatabase[url];
    }
  }
  return result;
};

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
    password: 'Shabadoo'
  },
  userID2 : {
    id: 'userID2',
    email: 'MontyBurns@Simpsons.com',
    password: 'Bobo'
  }
};

// URLS PAGE
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase,
    userId: req.cookies['userId'] };
  res.render("urlsIndex", templateVars);
  res.cookie('userId');

});

app.post("/urls", (req, res) => {
// this line generates a string and sets it as the key
// and makes it equal to the user entered form input
  const newKey = generateRandomString();
  console.log(req.body);
  //NEW longUrl now disappears -- changed path in urlsIndex
  urlDatabase[newKey] = req.body.longURL;
  res.redirect(`/urls/${newKey}`);


});

// LOGIN - LOGOUT - REGISTER

app.get('/login', (req, res) =>{
  const templateVars = {userId: req.cookies.userId};
  res.render('login', templateVars);
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userId = findUserByEmail(userEmail);
  if (users[userId].password === userPassword) {
    res.cookie("userId", userId);
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.post('/logout', (req,res)=> {
  res.clearCookie('userId');
  res.redirect('/login');
});

app.get('/register', (req, res)=>{
  const templateVars = {userId: req.cookies.userId};
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  users[userID] = {
    id: userID,
    email: userEmail,
    password: userPassword
  };
  const result = validateLogin(userEmail, userPassword);
  if (result.error) {
    return res.send(result.error);
  }
  res.cookie('email', result.data.email);
  res.redirect('/');
  
  res.cookie('userId', userID);
  res.redirect('/urls');
});



// NEW
app.get("/urls/new", (req, res) => {
  
  const userId = req.cookies.userId;
  const templateVars = { userId };
  if (!userId) {
    res.redirect('/login');
  }
  res.render("urlsNew", templateVars);
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
  const userId = req.cookies.userId;
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], userId };
  res.render("urlsShow", templateVars);
});

app.post("/urls/:shortURL/edit", (req,res) => {
  // const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  const templateVars = {userId: req.cookies.userId};
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`, templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.get("/", (req, res) => {
  res.send("Hello!");
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

