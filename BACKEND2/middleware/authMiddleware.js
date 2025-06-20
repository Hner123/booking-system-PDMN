import jwt from "jsonwebtoken";

export const verifyAdminToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // console.log("Auth header:", authHeader);

    if (!authHeader) {
      // console.log("No authorization header provided");
      return res.status(401).json({ message: "No authorization header provided" });
    }

    const token = authHeader.split(" ")[1]; // Bearer TOKEN
    // console.log("Extracted token:", token ? "Token present" : "No token");

    if (!token) {
      // console.log("No token provided");
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    // console.log("Token decoded successfully:", decoded);

    // Add user info to request object
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Token verification error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }

    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
