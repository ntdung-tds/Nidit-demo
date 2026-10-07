import { Router, type IRouter } from "express";
import { requireAuth } from "../lib/auth";
import healthRouter from "./health";
import authRouter from "./auth";
import feedsRouter from "./feeds";
import siteRouter from "./site";
import navigationRouter from "./navigation";
import pagesRouter from "./pages";
import homeRouter from "./home";
import articlesRouter from "./articles";
import adminArticlesRouter from "./admin-articles";
import researchRouter from "./research";
import datasetsRouter from "./datasets";
import libraryRouter from "./library";
import searchRouter from "./search";
import inquiriesRouter from "./inquiries";
import crawlerRouter from "./crawler";
import aiRouter from "./ai";
import systemRouter from "./system";

const router: IRouter = Router();

// Công khai (và các đường dẫn tự xác thực bằng token trên URL)
router.use(healthRouter);
router.use(authRouter);
router.use(feedsRouter);

// Mọi đường dẫn /admin/* phía sau đều yêu cầu đăng nhập
router.use("/admin", requireAuth);

router.use(siteRouter);
router.use(navigationRouter);
router.use(pagesRouter);
router.use(homeRouter);
router.use(articlesRouter);
router.use(adminArticlesRouter);
router.use(researchRouter);
router.use(datasetsRouter);
router.use(libraryRouter);
router.use(searchRouter);
router.use(inquiriesRouter);
router.use(crawlerRouter);
router.use(aiRouter);
router.use(systemRouter);

router.use((_req, res) => {
  res.status(404).json({ error: "Không tìm thấy địa chỉ yêu cầu" });
});

export default router;
