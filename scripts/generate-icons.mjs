import sharp from "sharp";
import { mkdirSync } from "node:fs";

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#2e7d32"/>
  <circle cx="256" cy="300" r="130" fill="#e0562c"/>
  <path d="M256 170 C 230 120, 200 110, 180 130 C 210 150, 230 160, 256 170 Z" fill="#4caf50"/>
  <path d="M256 170 C 282 120, 312 110, 332 130 C 302 150, 282 160, 256 170 Z" fill="#4caf50"/>
  <circle cx="330" cy="250" r="14" fill="#ffffff" opacity="0.9"/>
</svg>
`;

mkdirSync("public/icons", { recursive: true });

const sizes = [192, 512];
for (const size of sizes) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(`public/icons/icon-${size}.png`);
}

await sharp(Buffer.from(svg)).resize(180, 180).png().toFile("public/icons/apple-touch-icon.png");

console.log("icons generated");
