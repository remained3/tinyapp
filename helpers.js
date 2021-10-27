const bcrypt = require("bcryptjs");

const findUserByEmail = function(email, users) {
  for (let userID in users) {
    const user = users[userID];
    if (email === user.email) {
      return user;
    }
  } return false;
};

//create a new user
const newUser = function(email, password, users) {
  const userID = generateRandomString();
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  users[userID] = {
    id: userID,
    email,
    password: hashedPassword
  };
  return userID;
};

//check if user is valid
const authentication = function(email, password, users) {
  const user = findUserByEmail(email, users);
  if (user && bcrypt.compare(password, user.password)) {
    return user;
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

//only show urls the user created
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