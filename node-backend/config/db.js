import mongoose from "mongoose"; //importing mongoose to connect with db instance
import dns from "dns";

//setting dns servers to avoid dns resolution issues in some environments
//allow srv records to be resolved properly, especially in environments with custom dns configurations
//only use this if you are facing dns resolution issues, otherwise it can be omitted
dns.setServers(["8.8.8.8", "8.8.4.4"]);

//function to connect with db instance
const connectDB = async () => {
  try {
    //connection with db using mongoose connect method and passing the connection string from environment variable
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Connection Failed:", error.message);
    process.exit(1); //exit the process with failure code 1 if connection fails
  }
};

//exporting the db connection for use in other parts of the application
export default connectDB;