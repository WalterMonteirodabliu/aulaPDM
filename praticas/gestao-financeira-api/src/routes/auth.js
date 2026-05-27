import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { loginSchema, registerSchema } from "../schemas/authSchema.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

function gerarToken(user) {
  return jwt.sign(
    { sub: user.id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? "7d" }
  );
}

// POST /auth/register
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    const existe = await prisma.user.findUnique({ where: { email } });
    if (existe) return res.status(409).json({ error: "E-mail já cadastrado" });
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hash } });
    const token = gerarToken(user);
    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (e) { next(e); }
});

// POST /auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    const senhaOk = user && await bcrypt.compare(password, user.password);
    if (!senhaOk) return res.status(401).json({ error: "Credenciais inválidas" });
    const token = gerarToken(user);
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (e) { next(e); }
});

// GET /auth/me
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (e) { next(e); }
});

export default router;
