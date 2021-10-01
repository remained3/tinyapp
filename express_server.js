const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
const { findUser, newUser, authentication, generateRandomString, urlForUser} = require("./helpers")

app.set("view engine", "ejs")

//databases
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
}


app.get("/register", (req, res) => {
  
  const templateVars = { 
    user: users[req.cookies["user_id"]]
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]]
  };
  res.render("login", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, salt)

  //check fields have been completed
  if (!email || !password) {
    res.status(400);
    res.send("Error (400): email and password fields cannot be empty.")
    return;
  }

  const userFound = findUser(email, users);
  if (userFound) {
    res.status(400).send('Sorry, that email has already been registered');
    return;
  }
  const userID = newUser(email, password, users);
  res.cookie('user_id', userID);
  res.redirect('/urls')
});

//Create a shortened URL and redirects to a page showing the new URL
app.post("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if(!user) {
    res.redirect("/register");
    return;
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
  longURL: req.body.longURL,
  userID: user.id
}
  res.redirect(`/urls/${shortURL}`);       
});

//update url
app.post("/urls/:shortURL", (req, res) => {
  const longURL = req.body.longURL;
  urlDatabase[req.params.shortURL].longURL = longURL;
  res.redirect("/urls");
});

app.get("/url/:shortURL", (req, res) => {
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]]
  if (!user) {
    res.send("You must log in to see URLs")
  }
  const userURL = urlForUser(user.id, urlDatabase)
  const templateVars = { 
    urls: userURL,
    user,
   };
  res.render("urls_index", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const shortURL = req.params.shortURL;
  if (!user) {
    res.redirect("/login");
  }
  const forOwner = urlForUser(user.id, urlDatabase);
  if (!forOwner[shortURL]) {
    res.send("Links can only be updated by the creator");
    return;
  }
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = {
    shortURL,
    longURL,
    user
  };
  res.render("urls_show", templateVars);
});

//redirect user to the long url website
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
    
  } else {
    res.send("This link does not exisit");
  }
});

//delete a url
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

//allow user to login 
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password

  const user = authentication(email, password, users);
  if(user) {
    res.cookie('user_id', user.id);
    res.redirect("/urls"); // and redirect user to the /urls
    return;
  } else {
    res.status(401).send("No user with that email address found!");
  }
});

//log user out
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
})

//makes server listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});