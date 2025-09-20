'use strict';
const bcrypt = require('bcryptjs');  

module.exports = {
  up: (models, mongoose) => {
    const password = "admin@123";
    const hashed_pass = bcrypt.hashSync(password, 10);

    return models.users.insertMany([
      {
        name: "admin",
        email: "admin@gmail.com",
        password: hashed_pass,
        user_type: new mongoose.Types.ObjectId("675870dbae9c6b1dffa1a7ed")
      }
    ]).then(res => {
      console.log("Inserted:", res.length);
    });
  },

  down: (models, mongoose) => {
    return models.users.deleteMany({
      email: "admin@gmail.com"
    }).then(res => {
      console.log("Deleted:", res.deletedCount);
    });
  }
};

