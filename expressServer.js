const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const generateRandomString = () =>{
  const charecters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const stringLength = 6;
  let randomString = '';
  for (let i = 0; i < stringLength; i++) {
    let randomNum = Math.floor(Math.random() * charecters.length);
    randomString += charecters.substring(randomNum, randomNum + 1);
  }
  return randomString;
};
console.log(generateRandomString());

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res)=> {
  const templateVars = { urls: urlDatabase };
  res.render('urlsIndex', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urlsNew");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get('/urls/:shortURL', (req, res)=> {
  // :shortURL is the vaule that we enter into the browser that leads to a key in the database.
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urlsShow', templateVars);
});

app.get('/hello', (req, res) => {
  res.send('<html><body><h1>Hello World!</h1></body><!html>\n');
});

app.listen(PORT,()=>{
  console.log(`Example app listening on ${PORT}!`);
});