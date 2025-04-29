import jwt from "jsonwebtoken";

const messages = {
  error: {
    invalidToken: "Invalid token",
    invalidTokenFormat: "Invalid token format",
  },
};

const secureRequestMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  const secret = process.env.JWT_SECRET;
  try {
    const decoded = jwt.verify(token.split(" ")[1], secret);
    if (!decoded?._id) {
      return res.status(401).json({ message: messages.error.invalidToken });
    }
    req.body.decodedToken = decoded;
    next();
  } catch (err) {
    console.log("err", err);
    return res.status(401).json({ message: messages.error.invalidTokenFormat });
  }
};

export { secureRequestMiddleware };
