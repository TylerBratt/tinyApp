// REQUIRED
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

// SET and USEs
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// GENERATE THE 6 DIGIT SHORL URL
const generateRandomString = () => {
  const newKey = Math.random().toString(36).substring(2,8);
  return newKey;
};

// STARTING DATABASE
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// USERS DATABASE
const users = {
  userID : {
    id: "JoeyJoeJoeJrShabadu",
    email: 'BarneysFriend@Simpsons.com',
    password: 'dumbestName'
  },
  user2ID : {
    id: 'MontyBurns',
    email: 'NukeSpringfield@Simpsons.com',
    password: 'Bobo'
  }
};

// URLS PAGE
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase,
    username: req.cookies['username'] };
  res.render("urlsIndex", templateVars);
});

app.post("/urls", (req, res) => {
// this line generates a string and sets it as the key
// and makes it equal to the user entered form input
  const newKey = generateRandomString();
  urlDatabase[newKey] = req.body.longURL;
  res.redirect(`/urls/${newKey}`);
});

// LOGIN - LOGOUT - REGISTER
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post('/logout', (req,res)=> {
  res.clearCookie();
  res.redirect('/urls');
});

app.get('/register', (req, res)=>{
  const templateVars = {username: req.cookies.username};
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const userID = generateRandomString();
  const username = req.body.username;
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  users.userID = {
    id: userID,
    email: userEmail,
    password: userPassword
  };
  res.cookie('username', username);
  res.redirect('urls');
});

// NEW
app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies.username};
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
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urlsShow", templateVars);
});

app.post("/urls/:shortURL/edit", (req,res) => {
  // const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`);
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

