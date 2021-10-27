const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");

const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);

const { findUserByEmail, newUser, authentication, generateRandomString, urlForUser} = require("./helpers");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["This is a key for encryption", "have a great day"]
}));

//databases
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};



app.get("/", (req, res) => {
  const userID = users[req.session.user_id];
  if (!userID) {
    res.redirect("login");
  }
  res.redirect("/urls");
});



//login & registration
app.get("/register", (req, res) => {
  const userID = users[req.session.user_id];
  const templateVars = {
    user: userID
  };
  if (userID) {
    res.redirect("/urls");
  }
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send("Error (400): email and password fields cannot be empty.");
    return;
  }
  const userFound = findUserByEmail(email, users);
  if (userFound) {
    res.status(400).send('Sorry, that email has already been registered');
    return;
  }
  const newUserID = newUser(email, password, users);
  req.session.user_id = users[newUserID].id;
  res.redirect('/urls');
});


app.get("/login", (req, res) => {
  const userID = users[req.session.user_id];
  const templateVars = {
    user: userID
  };
  if (userID) {
    res.redirect("/urls");
  }
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = authentication(email, password, users);
  if (user) {
    req.session.user_id = user.id;
    res.redirect("/urls");
    return;
  } else {
    res.status(401).send("No user with that email address found!");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});



//url pages

app.get("/url/:shortURL", (req, res) => {
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls/new", (req, res) => {
  const userID = users[req.session.user_id];
  const templateVars = {
    user: userID
  };
  if (userID) {
    res.render("urls_new", templateVars);
    return;
  }
  res.redirect("/login");
  return;
});

app.get("/urls", (req, res) => {
  const userID = users[req.session.user_id];
  if (!userID) {
    res.send("Please login to see your links!");
    return;
  }
  const userURL = urlForUser(userID, urlDatabase);
  const templateVars = {
    urls: userURL,
    user: userID,
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const userID = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  if (!userID) {
    res.send("You must log in to see your links");
  }
  if (!urlDatabase[req.params.shortURL]) {
    res.send("Link does not exist");
    return;
  }
  const forOwner = urlForUser(userID, urlDatabase);
  if (!forOwner[shortURL]) {
    res.send("You do not have permission to change this link");
  }
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = {
    shortURL,
    longURL,
    user: userID,
  };
  res.render("urls_show", templateVars);
});

//redirect user to the long url website
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
    
  } else {
    res.send("Link does not exist");
  }
});

//Create a shortened URL and redirects to a page showing the new URL
app.post("/urls", (req, res) => {
  const userID = users[req.session.user_id];
  if (!userID) {
    res.redirect("/register");
    return;
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: userID
  };
  res.redirect(`/urls/${shortURL}`);
});

//update url
app.post("/urls/:shortURL", (req, res) => {
  const userID = users[req.session.user_id];
  if (!userID) {
    res.redirect("/register");
    return;
  }
  const longURL = req.body.longURL;
  urlDatabase[req.params.shortURL].longURL = longURL;
  res.redirect("/urls");
});


//delete an owned url
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  const forOwner = urlForUser(userID, urlDatabase);
  if (!userID) {
    res.send("Please login to make changes to this content");
  }
  
  if (!forOwner[shortURL]) {
    res.send("You do not have permission to change this link");
  }

  delete urlDatabase[shortURL];
  res.redirect('/urls');
});


//makes server listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});