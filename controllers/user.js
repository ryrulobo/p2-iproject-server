const { comparePasword, hashPassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { User } = require("../models");

class UserController {
  static async register(req, res, next) {
    try {
      const { username, email, password, location } = req.body;

      // Check for empty input
      if (!username) {
        throw { name: "Username is required" };
      }
      if (!email) {
        throw { name: "Email is required" };
      }
      if (!password) {
        throw { name: "Password is required" };
      }
      if (!location) {
        throw { name: "Location is required" };
      }

      // Check if username/email already been used
      const emailCheck = await User.findOne({
        where: {
          email,
        },
      });
      if (emailCheck) throw { name: "Email must be unique" };

      const usernameCheck = await User.findOne({
        where: {
          email,
        },
      });
      if (usernameCheck) throw { name: "Username must be unique" };

      // Register new user
      await User.create({ username, email, password, location });

      // Response
      const findUser = await User.findOne({
        where: {
          email,
        },
      });

      res.status(201).json({
        id: findUser.id,
        username: findUser.username,
        email: findUser.email,
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { username, password } = req.body;

      // Check for empty input
      if (!username) {
        throw { name: "Username is required" };
      }
      if (!password) {
        throw { name: "Password is required" };
      }

      const findUser = await User.findOne({
        where: {
          username,
        },
      });

      // Check for invalid username/password
      if (!findUser) {
        throw { name: "Invalid email/password" };
      }

      const validatePassword = comparePasword(password, findUser.password);

      if (!validatePassword) {
        throw { name: "Invalid email/password" };
      }

      // Create payload & access_token
      const payload = {
        id: findUser.id,
      };

      const access_token = signToken(payload);

      // Create response
      const loggedInUsername = findUser.username;

      res.status(200).json({ access_token, loggedInUsername });
    } catch (err) {
      next(err);
    }
  }

  static async edit(req, res, next) {
    try {
      const userId = req.user.id;

      const user = await User.findByPk(userId);
      if (!user) {
        throw { name: "User not found" };
      }

      let { username, email, password, profilePicture, description, location } =
        req.body;

      if (password) {
        password = hashPassword(password);
      }

      await User.update(
        {
          username,
          email,
          password,
          profilePicture,
          description,
          location,
        },
        {
          where: {
            id: userId,
          },
        }
      );

      res.status(200).json({ message: `User data updated` });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UserController;
