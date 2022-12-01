const bcrypt = require("bcryptjs");

const credentials = {
  username: "admin",
  password: "admin123",
};

bcrypt
  .hash(credentials.password, 9)
  .then((hash) => {
    console.log(hash);
  })
  .catch((err) => console.log(err));
