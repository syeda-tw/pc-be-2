//this middleware is used to authenticate the user for secure calls
const secureRequestMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: messages.error.serverError });
  }
  try {
    const decoded = jwt.verify(token, secret);
    if (!decoded?._id) {
      return res.status(401).json({ message: messages.error.invalidToken });
    }
    req.body.decodedToken = decoded;
    next();
  } catch (err) {
    console.error("Invalid token:", err.message);
    return res.status(401).json({ message: messages.error.invalidTokenFormat });
  }
};

export { secureRequestMiddleware };
