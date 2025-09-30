// tools/generate_og_pages.js
// Autogenera /og/*.jpg y /p/*.html para cada propiedad del JSON.
// - Detecta BASE automáticamente en GitHub Actions (owner.github.io vs project pages)
// - Permite override local con tools/og.config.json ({"baseUrl":"https://..."})
// Requiere: npm i sharp
// Uso local:   node tools/generate_og_pages.js
// En CI: lo ejecuta la acción de GitHub.

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

/** ================== BASE URL ================== **/
function detectBase() {
  // 1) og.config.json (para ejecutar localmente o en CI)
  const cfgPath = path.join(process.cwd(), "tools", "og.config.json");
  if (fs.existsSync(cfgPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
      if (cfg.baseUrl) return String(cfg.baseUrl).replace(/\/+$/,"");
    } catch {}
  }

  // 2) Variable de entorno (útil en GitHub Actions)
  if (process.env.OG_BASE_URL) {
    return String(process.env.OG_BASE_URL).replace(/\/+$/,"");
  }

  // 3) Automático en GitHub Actions
  const repo = process.env.GITHUB_REPOSITORY || ""; // "owner/repo"
  const [owner, name] = repo.split("/");
  if (owner && name) {
    const isUserSite = (name.toLowerCase() === `${owner.toLowerCase()}.github.io`);
    return `https://${owner}.github.io` + (isUserSite ? "" : `/${name}`);
  }

  // 4) Fallback: SIEMPRE al dominio principal (no al piloto)
  return "https://altorrainmobiliaria.github.io";
}

const BASE = detectBase();

/** ================== RUTAS ================== **/
const ROOT = process.cwd();
const DATA_CANDIDATES = [
  path.join(ROOT, "properties", "data.json"),
  path.join(ROOT, "PRUEBA-PILOTO", "properties", "data.json"),
];
const OUT_OG = path.join(ROOT, "og");
const OUT_P  = path.join(ROOT, "p");
fs.mkdirSync(OUT_OG, { recursive: true });
fs.mkdirSync(OUT_P,  { recursive: true });

function findDataPath() {
  for (const p of DATA_CANDIDATES) if (fs.existsSync(p)) return p;
  throw new Error("No se encontró properties/data.json");
}

/** ================== HELPERS ================== **/
function sanitizeId(id) { return String(id||"").trim().replace(/[^\w\-\.]/g, ""); }
function esc(s){ return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function priceFmt(n){ try { return Number(n).toLocaleString("es-CO"); } catch { return n; } }
function absUrl(rel){ return `${BASE}${rel.startsWith("/") ? "" : "/"}${rel}`; }

function pickBestImage(p){
  if (p.shareImage && typeof p.shareImage === "string") return p.shareImage;
  if (p.image && typeof p.image === "string") return p.image;
  if (Array.isArray(p.images) && p.images.length > 0) return p.images[0];
  return null;
}

function tryResolveLocal(rel) {
  // devuelve ruta de archivo local intentando con raíz y con /PRUEBA-PILOTO
  const clean = rel.replace(/^\//,"");
  const candidates = [
    path.join(ROOT, clean),
    path.join(ROOT, "PRUEBA-PILOTO", clean),
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return null;
}

function buildHtml(p, ogRel){
  const id = sanitizeId(p.id);
  const detUrl = absUrl(`/detalle-propiedad.html?id=${encodeURIComponent(id)}`);
  const ogImg = absUrl(ogRel);
  const ogUrl = absUrl(`/p/${encodeURIComponent(id)}.html`);

  const baseTitle = p.title || "Propiedad";
  const chips = [];
  if (p.sqm)   chips.push(`${p.sqm} m²`);
  if (p.beds)  chips.push(`${p.beds}H`);
  if (p.baths) chips.push(`${p.baths}B`);
  const metaTitle = chips.length ? `${baseTitle} – ${chips.join(", ")}` : baseTitle;

  const pieces = [];
  if (p.city) pieces.push(p.city);
  if (p.type) pieces.push(p.type);
  if (p.sqm)  pieces.push(`${p.sqm} m²`);
  if (p.beds) pieces.push(`${p.beds} habitaciones`);
  if (p.baths)pieces.push(`${p.baths} baños`);
  if (p.price)pieces.push(`Precio: $${priceFmt(p.price)}`);
  const description = esc(pieces.join(" • "));

  const jsonLD = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": baseTitle,
    "url": ogUrl,
    "image": [ogImg],
    "description": description,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": p.city || "Cartagena",
      "addressRegion": "Bolívar",
      "addressCountry": "CO"
    },
    "floorSize": p.sqm ? {"@type":"QuantitativeValue","value":p.sqm,"unitCode":"MTK"} : undefined,
    "offers": p.price ? {
      "@type": "Offer",
      "price": p.price, "priceCurrency": "COP", "availability": "https://schema.org/InStock"
    } : undefined
  };

  return `<!DOCTYPE html><html lang="es"><head>
<meta charset="utf-8"/>
<title>${esc(metaTitle)} | Altorra</title>
<link rel="canonical" href="${detUrl}"/>
<meta http-equiv="refresh" content="0; url=${detUrl}"/>
<meta name="robots" content="index, follow"/>
<meta property="og:site_name" content="ALTORRA Inmobiliaria"/>
<meta property="og:title" content="${esc(metaTitle)}"/>
<meta property="og:description" content="${description}"/>
<meta property="og:type" content="website"/>
<meta property="og:url" content="${ogUrl}"/>
<meta property="og:image" content="${ogImg}"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${esc(metaTitle)}"/>
<meta name="twitter:description" content="${description}"/>
<meta name="twitter:image" content="${ogImg}"/>
<script type="application/ld+json">${JSON.stringify(jsonLD)}</script>
<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Arial,sans-serif;padding:32px;line-height:1.4}</style>
</head><body>
<p>Redirigiendo a <a href="${detUrl}">${esc(baseTitle)}</a>…</p>
</body></html>`;
}

/** ================== MAIN ================== **/
async function processOne(p) {
  const id = sanitizeId(p.id);
  if (!id) return;

  const srcRel = pickBestImage(p);
  let srcPath = srcRel ? tryResolveLocal(srcRel) : null;

  // Si no hay imagen, generar placeholder
  const ogRel = `/og/${id}.jpg`;
  const ogAbs = path.join(process.cwd(), ogRel.replace(/^\//,""));

  if (srcPath) {
    await sharp(srcPath).resize(1200, 630, { fit: "cover", position: "center" })
      .jpeg({ quality: 85, progressive: true }).toFile(ogAbs);
  } else {
    const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#efefef"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="48" fill="#222">
        ${esc(p.title || "ALTORRA Inmobiliaria")}
      </text>
    </svg>`;
    const buf = Buffer.from(svg);
    await sharp(buf).jpeg({ quality: 85, progressive: true }).toFile(ogAbs);
  }

  const html = buildHtml(p, ogRel);
  fs.writeFileSync(path.join(OUT_P, `${id}.html`), html, "utf8");
}

async function main() {
  const dataPath = findDataPath();
  const list = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  if (!Array.isArray(list)) throw new Error("El JSON de propiedades debe ser un arreglo.");
  for (const p of list) await processOne(p);
  console.log(`OG OK: generadas ${list.length} páginas en /p y ${list.length} imágenes en /og (BASE=${BASE}).`);
}
main().catch(err => { console.error(err); process.exit(1); });
