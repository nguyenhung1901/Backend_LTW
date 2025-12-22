module.exports = function (req, res, next) {
  console.log("=== CHECK LOGIN ===");
  console.log("URL:", req.url);
  console.log("Session ID:", req.sessionID);
  console.log("Session user:", req.session.user);
  console.log("Cookie received:", req.headers.cookie);
  console.log("===================");

  if (!req.session.user) {
    console.log("NO USER IN SESSION - REJECTING");
    return res.status(401).json({ error: "Unauthorized" });
  }
  console.log("USER AUTHENTICATED");
  next();
};