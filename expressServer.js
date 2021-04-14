const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const generateRandomString = () => {
  const newKey = Math.random().toString(36).substring(2,8);
  return newKey;
};


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
  console.log('Cookies: ', req.cookies);
  console.log('Signed Cookies: ', req.signedCookies);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase,
    username: req.cookies['username'] };
  res.render("urlsIndex", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urlsNew");
});

app.post("/urls", (req, res) => {
// this line generates a string and sets it as the key
// and makes it equal to the user entered form input
  const newKey = generateRandomString();
  urlDatabase[newKey] = req.body.longURL;
  res.redirect(`/urls/${newKey}`);
});

//the path takes a : because it is looking for a variable
// STOP FORGETTING THE '/'!!!!!!!!!
app.post("/urls/:short/delete", (req, res) => {
  // entering the correct path of on object is very important...
  const shortURL = req.params.short;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  // :shortURL is the vaule that we enter into the browser that leads to a key in the database.
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urlsShow", templateVars);
});

app.post("/urls/:shortURL", (req,res) => {
  // const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post('/logout', (req,res)=> {
  res.clearCookie();
  res.redirect('/urls');
})

app.get("/hello", (req, res) => {
  res.send(`<html><body><h1>Hello World!</h1></body><!html>\n`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on ${PORT}!`);
});

