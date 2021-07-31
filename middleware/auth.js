const jwt = require("jsonwebtoken");
const env = require("./../config/env");

const date = new Date();
const n = date.getTime() + 1296000000;
const expiryDate = new Date(n).toISOString();

module.exports = {
  generateJWTToken: (username, email) => {
    const user = {
      email: email,
      username: username,
    };
    const token = jwt.sign(user, "SECRET", { expiresIn: 1296000 });
    return token;
  },

  validateToken: async (req, res) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, env.SECRET);
      const email =
        decoded.sub ||
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
        },
      });
      const sessionToken = {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          image: null,
        },
        expires: expiryDate,
      };
      return sessionToken;
    } catch (err) {
      return false;
    }
  },
};
