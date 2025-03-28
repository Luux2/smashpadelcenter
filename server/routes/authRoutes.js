const express = require("express");
const passport = require("../config/passport");
const user = require("../config/roles");
const databaseService = require("../Services/databaseService");

const router = express.Router();

/**
 * @swagger
 * /api/v1/:
 *   get:
 *     summary: Check if the server is running
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Server is running
 */
router.get("/", (req, res) => {
  res.send("Server is running");
});

/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in
 *       401:
 *         description: Incorrect credentials
 */
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res.status(401).json({ message: info?.message || "Unauthorized" });

    req.login(user, (err) => {
      if (err) return next(err);
      return res.json({ message: "Logged in successfully", user });
    });
  })(req, res, next);
});

/**
 * @swagger
 * /api/v1/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Error creating user
 */
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const newUser = await databaseService.createUser({ username, password });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users and their roles (Admin only)
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of users and their roles
 *       401:
 *         description: Unauthorized - No user logged in
 *       403:
 *         description: Forbidden - User is not an admin
 *       500:
 *         description: Server error
 */
router.get("/users", async (req, res) => {
  try {
    // Ensure user is logged in
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No user logged in" });
    }

    // Ensure user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden - Admins only" });
    }

    // Fetch users from database
    const users = await databaseService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/v1/change-role:
 *   post:
 *     summary: Change the role of a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role updated
 *       400:
 *         description: Error updating role
 *       403:
 *         description: Access Denied
 */
router.post("/change-role", user.can("access admin page"), async (req, res) => {
  const { username, role } = req.body;
  try {
    const updatedUser = await databaseService.updateUserRole(username, role);
    res.status(200).json({ message: "Role updated", user: updatedUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/v1/role:
 *   get:
 *     summary: Get the role of the logged-in user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User role
 *       401:
 *         description: Unauthorized
 */
router.get("/role", (req, res) => {
  try {
    console.log("Cookies:", req.cookies); // Debugging
    console.log("Session ID:", req.sessionID); // Debugging
    console.log("Session Data:", req.session); // Debugging
    console.log("User from session:", req.user); // Debugging

    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No user logged in" });
    }

    res.json({ role: req.user.role });
  } catch (err) {
    console.error("Error fetching user role:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /api/v1/logout:
 *   post:
 *     summary: Log out the current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       500:
 *         description: Internal Server Error
 */
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Error logging out:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
});

module.exports = router;
