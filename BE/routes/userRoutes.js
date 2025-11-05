import express from "express";
import * as userController from "../controllers/userControllers.js";

const router = express.Router();

router.post("/signIn", userController.signIn);
router.get("/users", userController.getUsers);
router.get("/users/:id", userController.getUserById);
router.post("/users", userController.createUser);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);

export default router;
