const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('urls', (req, res)=> {
  const templateVars = { urls: urlDatabase };
  res.render('urlsIndex', templateVars);
});

app.get('/urls/:shortURL', (req, res)=> {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL };
  res.render('urlsShow', templateVars);
});

app.get('/hello', (req, res) => {
  res.send('<html><body><h1>Hello World!</h1></body><!html>\n');
});

app.listen(PORT,()=>{
  console.log(`Example app listening on ${PORT}!`);
});