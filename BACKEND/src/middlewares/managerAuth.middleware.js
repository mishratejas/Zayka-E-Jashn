import jwt from "jsonwebtoken";

export const verifyManagerToken= (req,res,next)=>{
    try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (decoded.role !== "manager") {
      return res.status(403).json({ message: "Forbidden: Not a manager" });
    }

    req.manager = decoded; // Optional: attach to req
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};