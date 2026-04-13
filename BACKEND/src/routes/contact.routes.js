import express from "express";
import { sendContactMessage } from "../controllers/contact.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { contactSchema } from "../validators/schemas.js";

const router = express.Router();

router.post("/", validate(contactSchema), sendContactMessage);

export default router;