const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://paghdalparth22:vvNLtvmfp9K6Sget@cluster0.puiareb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    // await mongoose.connect('mongodb+srv://boostnowchat:Boost@123@cluster0.mx0e6m5.mongodb.net/gameDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
