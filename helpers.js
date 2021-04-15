const generateRandomString = () => {
  const newKey = Math.random().toString(36).substring(2,8);
  return newKey;
};

const findUserByEmail = (email, users) => {
  for (const greaterKey in users) {
    const lesserObj = users[greaterKey];
    const userEmail = lesserObj.email;
    if (userEmail === email) {
      return lesserObj.id;
    }
  }
};

const urlsForUser = (userID, urlDatabase) => {
  const userUrls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === userID) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
};

const userEmails = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

const userCookie = (cookie, users) => {
  for (const user in users) {
    if (cookie === user) {
      return true;
    }
  }
  return false;
};

module.exports = {
  generateRandomString,
  findUserByEmail,
  urlsForUser,
  userEmails,
  userCookie
};