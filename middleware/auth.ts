import * as jwt from "jsonwebtoken";
import * as env from "../config/env";
import prisma from "../lib/prisma";

// const date = new Date();
// const n = date.getTime() + 1296000000;
// const expiryDate = new Date(n).toISOString();

module.exports = {
  generateJWTToken: (username, email) => {
    const user = {
      email: email,
      username: username,
    };
    const token = jwt.sign(user, "SECRET", { expiresIn: 1296000 });
    return token;
  },

  getSessionFromToken: async ({ req }) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      if (token) {
        const decoded = jwt.verify(token, env.SECRET);
        const email =
          decoded.sub ||
          decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
          decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];

        const utcSeconds = decoded.exp;
        const d = new Date(0); // The 0 there is the key, which sets the date to the epoch
        d.setUTCSeconds(utcSeconds);
        const expiryDate = d.toISOString();

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
      } else return;
    } catch (err) {
      return null;
    }
  },
};
