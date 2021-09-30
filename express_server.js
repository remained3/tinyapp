const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

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

//Helper functions for registration/ authentication

const findUser = function (email, users) {
  for (let userID in users) {
    const user = users[userID];
    if (email === user.email) {
      return true
    }
  } return false;
}

const newUser = function (email, password, users) {
  const userID = generateRandomString()
  
  users[userID] = {
    id: userID,
    email,
    password,
  };
  return userID
}

const authentication = function (email, password, users) {
  const userFound = findUser(email, users);
  if (userFound && userFound.password === password) {
    return userFound;
  }
  return false;
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
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);       
});

app.get("/url/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
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
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
   };
  res.render("urls_index", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
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
    res.status(403).send("No user with that email address found!");
  }
});

//log user out
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
})

//RNG for creating a new url
function generateRandomString() {
  let outputString = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
  for (let i = 0; i < 6; i++) {
    outputString += characters.charAt(Math.floor(Math.random() * characters.length));
   }
   return outputString;
}

//makes server listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



