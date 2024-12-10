'use strict';

const user_type = require("../models/user_type");


module.exports = {
  up: (models, mongoose) => {
    return user_type.insertMany([
      {
        _id: "675870dbae9c6b1dffa1a7ed",
        user_type: "admin"
      },
      {
        _id: "67587113ae9c6b1dffa1a7ef",
        user_type: "buyer"
      },
      {
        _id: "675870f3ae9c6b1dffa1a7ee",
        user_type:"seller"
      }
    ]).then(res => {
      console.log(`${res.insertedCount} user types inserted.`);
    }).catch(err => {
      console.error("Error inserting user types:", err);
    });
  },

  down: (models, mongoose) => {
    return user_type.deleteMany(
      {
        _id: {
          $in: [
            '675870dbae9c6b1dffa1a7ed',
            '675870f3ae9c6b1dffa1a7ee',
            '67587113ae9c6b1dffa1a7ef'
          ]
        }
      }
    ).then(res => {
      console.log(`${res.deletedCount} user types deleted.`);
    }).catch(err => {
      console.error("Error deleting user types:", err);
    });
  }
};