const jwt = require("jsonwebtoken");
const cookieOptions = {
  httpOnly: true, // prevent XSS
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: "strict", // CSRF protection
  maxAge: 30 * 24 * 60 * 60 * 1000, // 1 day
};

const generateToken = (user) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return token;
};

module.exports = { cookieOptions, generateToken };
