const bcrypt = require("bcryptjs");

const findUserByEmail = function(email, users) {
  for (let userID in users) {
    const user = users[userID];
    if (email === user.email) {
      return user;
    }
  } return false;
};

const newUser = function(email, hashed, users) {
  const userID = generateRandomString();
  
  users[userID] = {
    id: userID,
    email,
    password: hashed,
  };
  return userID;
};

const authentication = function(email, password, users) {
  const userFound = findUserByEmail(email, users);
  if (userFound && bcrypt.compare(password === userFound.password)) {
    return userFound;
  }
  return false;
};

const generateRandomString = function() {
  let outputString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  for (let i = 0; i < 6; i++) {
    outputString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return outputString;
};

const urlForUser = (user_id, database) => {
  const userURL = {};
  for (let record in database) {
    if (database[record].userID === user_id) {
      userURL[record] = database[record];
    }
  }
  return userURL;
  
};


module.exports = { findUserByEmail, newUser, authentication, generateRandomString, urlForUser};