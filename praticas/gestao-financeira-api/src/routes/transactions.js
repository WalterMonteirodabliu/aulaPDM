import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "../schemas/transactionSchema.js";

const router = Router();

// Monta filtro de data por mês/ano
function buildDateFilter(month, year) {
  if (!month || !year) return undefined;
  const m = Number(month);
  const y = Number(year);
  if (!Number.isFinite(m) || !Number.isFinite(y) || m < 1 || m > 12) return undefined;
  return { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
}

// GET /transactions/summary?month=5&year=2026
router.get("/summary", async (req, res, next) => {
  try {
    const dateFilter = buildDateFilter(req.query.month, req.query.year);
    const where = dateFilter ? { date: dateFilter } : {};

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true },
    });

    let income = 0;
    let expense = 0;
    const byCategoryMap = new Map();

    for (const t of transactions) {
      const valor = Number(t.value);
      if (t.category.isIncome) income += valor;
      else expense += valor;

      const chave = t.category.id;
      const entrada = byCategoryMap.get(chave) ?? {
        categoryId: chave,
        displayName: t.category.displayName,
        background: t.category.background,
        isIncome: t.category.isIncome,
        total: 0,
      };
      entrada.total += valor;
      byCategoryMap.set(chave, entrada);
    }

    res.json({
      income,
      expense,
      balance: income - expense,
      byCategory: Array.from(byCategoryMap.values()),
    });
  } catch (e) { next(e); }
});

// GET /transactions?month=5&year=2026 - lista com filtro de mês/ano
router.get("/", async (req, res, next) => {
  try {
    const dateFilter = buildDateFilter(req.query.month, req.query.year);
    const where = dateFilter ? { date: dateFilter } : {};

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: "desc" },
    });
    res.json(transactions);
  } catch (e) { next(e); }
});

// POST /transactions
router.post("/", async (req, res, next) => {
  try {
    const data = createTransactionSchema.parse(req.body);
    const transaction = await prisma.transaction.create({
      data,
      include: { category: true },
    });
    res.status(201).json(transaction);
  } catch (e) { next(e); }
});

// PUT /transactions/:id
router.put("/:id", async (req, res, next) => {
  try {
    const data = updateTransactionSchema.parse(req.body);
    const transaction = await prisma.transaction.update({
      where: { id: req.params.id },
      data,
      include: { category: true },
    });
    res.json(transaction);
  } catch (e) { next(e); }
});

// DELETE /transactions/:id
router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.transaction.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) { next(e); }
});

export default router;
