import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import usersModel from "../users/users.model.js"

export const signup = async (req, res, next) => {
    try {
        const new_user = req.body;
        const { password: plain_password } = new_user;

        if (!plain_password) throw new Error(`Password not found`)
        const hashed_password = await bcrypt.hash(plain_password, 10)

        const results = await usersModel.create({
            ...new_user,
            password: hashed_password
        })
        res.json({ success: true, data: results })
    } catch (error) {
        next(error)
    }
}
export const signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await usersModel.findOne({ email }).lean();
        if (!user) throw new ErrorResponse(`User not found`, 401);

        const match = await bcrypt.compare(password, user.password);
        if (!match) throw new ErrorResponse(`Wrong password`, 401);

        if (!process.env.JWT_PRIVATE_KEY) throw new ErrorResponse('Could not sign token', 500)
        const JWT = jwt.sign({ _id: user._id, fullname: user.fullname, email: user.email }, process.env.JWT_PRIVATE_KEY)

        res.json({ success: true, data: JWT })

    } catch (error) {
        next(error)
    }
}

export const getAllUsers = async (req, res, next) => {
    try {
      const results = await usersModel.find({}); // Find all users in the database
      res.json({ success: true, data: results })
    } catch (error) {
      throw error;
    }
  };

  export const getUserById = async (req, res, next) => {
    const userId = req.params.user_id; // Get the user ID from the request parameters
  
    try {
      const user = await usersModel.findById(userId); // Find the user by ID in the database
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, data: user });
    } catch (error) {
      throw error;
    }
  };