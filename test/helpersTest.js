const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
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

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  C6UTxX: {
    longURL: "https://www.cbc.ca",
    userID: "Bb58lW"
  },
  b7UTxX: {
    longURL: "https://www.example.com",
    userID: "aJ48lW"
  },
};

describe('findUserByEmail', function() {
  it('should return an object containing the information of the user who owns the email provided', function() {
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedOutput = testUsers["userRandomID"];
    assert.deepEqual(user, expectedOutput, "the function worked!");
  });
  it('should return undefined with an invalid email', function() {
    const user = findUserByEmail("NotAValidEmail@example.com", testUsers);
    const expectedOutput = false;
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
});