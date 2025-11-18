import jwt from "jsonwebtoken";

export const authMiddleware = (req: any, res: any, next: any) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "Missing token" });
  }

  const token = header.split(" ")[1];

  // Demo mode bypass for testing
  if (token === "demo-token-12345") {
    req.user = { id_user: 1, nom: "Demo User", role: "parent" };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
