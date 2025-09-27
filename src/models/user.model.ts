import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      require: true
    },
    username: {
      type: String,
      minlength: 1,
      require: true
    },
    password: {
      type: String,
      minlength: 6,
      require: true 
    }
  },
  {timestamps: true}
)

const User = mongoose.model('User', userSchema);
export default User;