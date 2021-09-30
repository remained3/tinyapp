const findUser = function(email, users) {
  for (let userID in users) {
    const user = users[userID];
    if (email === user.email) {
      return true;
    }
  } return false;
};

const newUser = function(email, password, users) {
  const userID = generateRandomString();
  
  users[userID] = {
    id: userID,
    email,
    password,
  };
  return userID;
};

const authentication = function(email, password, users) {
  const userFound = findUser(email, users);
  if (userFound && userFound.password === password) {
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

module.exports = { findUser, newUser, authentication, generateRandomString}