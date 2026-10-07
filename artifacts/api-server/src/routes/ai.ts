import { Router, type IRouter } from "express";
import { SuggestWithAiBody, SuggestWithAiResponse } from "@workspace/api-zod";
import { parseInput } from "../lib/http";
import { rateLimit } from "../lib/rate-limit";
import { suggestWithAi } from "../lib/ai";

const router: IRouter = Router();

router.post(
  "/admin/ai/suggest",
  rateLimit({ windowMs: 10 * 60 * 1000, max: 40, message: "Bạn đã dùng gợi ý AI quá nhiều lần, vui lòng thử lại sau ít phút" }),
  async (req, res) => {
    const body = parseInput(SuggestWithAiBody, req.body);
    const result = await suggestWithAi(body);
    res.json(SuggestWithAiResponse.parse(result));
  },
);

export default router;
