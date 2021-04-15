const { assert } = require('chai');

const {
  generateRandomString,
  findUserByEmail,
  urlsForUser,
  userEmails,
  userCookie,
} = require('../helpers');

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

const testDatabase = {
  "k4iu9s": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "JoeyJoeJoeJrShabadu"
  },
  "9JDh6w": {
    longURL: "http://www.reddit.com",
    userID: "RadioactiveMan"
  },
  "5jeE98": {
    longURL: "http://www.youtube.com",
    userID: "ThrillHouse"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
  it('should return undefined when no user exists', function() {
    const user = findUserByEmail('abc@xyz.ca', testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});

describe('generateRandomString', function() {
  it('should return a random 6 charecter string', function() {
    const stringLength = generateRandomString().length;
    const expectedOutput = 6;
    assert.equal(stringLength, expectedOutput);
  });
  it('should always create a unique string', function() {
    const firstString = generateRandomString();
    const secondString = generateRandomString();
    assert.notEqual(firstString, secondString);
  });
});

describe('userEmails', function() {
  it('should return true if the email is valid', function() {
    const user = userEmails("user@example.com", testUsers);
    const expectedOutput = true;
    assert.equal(user, expectedOutput);
  });
  it('should return false if no user email exists', function() {
    const user = userEmails('hello@there.ca', testUsers);
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });
});

describe('urlsForUser', function() {
  it('should return an object for an individual user', function() {
    const userObject = urlsForUser("ThrillHouse", testDatabase);
    const expectedOutput = { 
      "5jeE98": {
        longURL: "http://www.youtube.com",
        userID: "ThrillHouse"
      }};
    assert.deepEqual(userObject, expectedOutput);
  });
  it('should return an empty object if there si no such user', function() {
    const noUser = urlsForUser("iAmNotReal", testDatabase);
    const expectedOutput = {};
    assert.deepEqual(noUser, expectedOutput);
  });
});

describe('userCookie', function() {
  it('it should return true if cookie matches user', function() {
    const cookie = userCookie("RadioactiveMan", testUsers);
    const expectedOutput = true;
    assert.equal(cookie, expectedOutput);
  });
  it('should return false of there is no cookie matching', function() {
    const noCookie = userCookie("Bort", testUsers);
    const expectedOutput = false;
    assert.equal(noCookie, expectedOutput);
  });
});