import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import bodyParser from "body-parser";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 images
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

  app.post("/api/analyze", async (req, res) => {
    try {
      const { images, metadata } = req.body;

      if (!images || images.length === 0) {
        return res.status(400).json({ error: "No image provided" });
      }

      const imageParts = images.map((img: any) => ({
        inlineData: {
          data: img.base64.replace(/^data:image\/\w+;base64,/, ""),
          mimeType: img.mimeType || "image/jpeg",
        }
      }));

      const prompt = `
        Phân tích vật phẩm sưu tầm sang trọng này (đá quý, thiên thạch, đồ cổ, tác phẩm nghệ thuật, v.v.).
        Thông tin người dùng cung cấp thêm (nếu có): ${JSON.stringify(metadata || {})}
        
        Trả về kết quả dưới định dạng JSON object mà không có markdown formatting, bao gồm các trường sau bằng tiếng Việt:
        {
          "analysis": {
            "type": "Tên ngắn/loại vật phẩm (VD: Ruby Huyết Bồ Câu)",
            "origin": "Nguồn gốc xuất xứ hoặc chất liệu (VD: Lục Yên, Việt Nam)",
            "luxuryLevel": "Phân loại độ hiếm (VD: Cực Kỳ Quý Hiếm)",
            "estimatedCategory": "Hạng mục tài sản (VD: Đá quý sưu tầm)",
            "targetAudience": "Đối tượng khách hàng mục tiêu",
            "estimatedMarketPrice": "Định giá thị trường dự kiến (VD: $5,000,000 - $8,000,000)"
          },
          "luxuryStory": {
            "title": "Tiêu đề bài viết (sang trọng, cuốn hút)",
            "description": "2-3 đoạn mô tả mang phong cách nhà đấu giá tinh hoa nghệ thuật (Sotheby's/Christie's). Giọng điệu siêu sang trọng, đậm chất điện ảnh.",
            "hashtags": "Các hashtag phù hợp (#Luxury #Sothebys #Rare...)",
            "slogan": "Câu slogan ngắn gọn sắc bén (VD: Tuyệt tác vượt thời gian)",
            "cta": "Lời kêu gọi hành động cho giới siêu giàu"
          }
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          prompt,
          ...imageParts,
        ],
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text;
      res.json(JSON.parse(responseText || "{}"));
    } catch (error) {
      console.error("Analysis Error:", error);
      res.status(500).json({ error: "Failed to analyze the image." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
