import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

const PUBLIC_ROOT = path.join(__dirname, "public");
const HTML_ROOT = path.join(PUBLIC_ROOT, "html");

// ✅ 1. 라우트 먼저
app.get("/", (_, res) => res.sendFile("landing.html", { root: HTML_ROOT }));
app.get("/:page", (req, res, next) => {
  const filePath = path.join(HTML_ROOT, `${req.params.page}.html`);
  res.sendFile(filePath, (err) => {
    if (err) next();
  });
});

// ✅ 2. 그다음 정적 파일 서빙 (css/js 등)
app.use(express.static(PUBLIC_ROOT));
app.use("/html", express.static(HTML_ROOT));

// 404 처리
app.use((_, res) => res.status(404).send("404 Not Found"));

app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
