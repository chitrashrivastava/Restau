const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/dbrestaurant')
  .then(() => {
    console.log('db connected');
  })
  .catch((err) => {
    console.error('Connection error:', err);
  });
