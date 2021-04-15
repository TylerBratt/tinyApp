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

const addNewUser = (name, email, password) => {
  const userId = generateRandomString();

  const newUserObj = {
    id: userId,
    name,
    email,
    password: bcrypt.hasshSync(password, saltRounds)
  };
};

const authenticateUser = (email, password) => {
  const user = findUserByEmail(email);

  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  } else {
    return false;
  }
};

module.exports = {
  generateRandomString,
  findUserByEmail,
  urlsForUser,
  addNewUser,
  authenticateUser
};