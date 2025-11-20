# CLAUDE.md - Altorra Inmobiliaria Codebase Guide

## Project Overview

**Project:** ALTORRA Inmobiliaria - Real Estate Platform
**Repository:** GitHub Pages hosted (altorrainmobiliaria.github.io)
**Market:** Cartagena, Colombia
**Type:** Static website with PWA capabilities

A full-featured real estate platform with smart search, AI chatbot, property comparison, mortgage calculator, and favorites system. All client-side, no backend required.

---

## Quick Reference

### Key Commands

```bash
# Generate OG images and property pages (requires Node.js + sharp)
npm install sharp
node tools/generate_og_pages.js

# Local development - just serve static files
npx serve .
# or
python -m http.server 8000
```

### Important Files

| File | Purpose |
|------|---------|
| `properties/data.json` | Main property database |
| `js/chatbot.js` | AI chatbot (largest file - 114KB) |
| `js/smart-search.js` | Advanced search with fuzzy matching |
| `scripts.js` | Main application orchestration |
| `tools/generate_og_pages.js` | Build script for social sharing |

### Configuration Values

```javascript
// WhatsApp contact number
const WHATSAPP = '573002439810';

// Cache TTLs
const DATA_TTL = 6 * 60 * 60 * 1000;  // 6 hours
const FRAGMENT_TTL = 7 * 24 * 60 * 60 * 1000;  // 7 days

// Pagination
const PAGE_SIZE = 9;

// Comparison limit
const MAX_COMPARE = 3;
```

---

## Directory Structure

```
ALTORRA-PILOTO/
├── /js/                    # JavaScript modules
│   ├── chatbot.js          # AI chatbot (2,647 lines)
│   ├── smart-search.js     # Fuzzy search engine
│   ├── comparador.js       # Property comparison
│   ├── calculadora.js      # Mortgage calculator
│   ├── favoritos.js        # Favorites system
│   ├── listado-propiedades.js  # Property listings
│   ├── form-validation.js  # Form validation
│   ├── cache-manager.js    # Smart caching
│   ├── analytics.js        # Privacy-friendly analytics
│   ├── performance.js      # Performance optimizations
│   └── utils.js            # Shared utilities
│
├── /css/                   # Feature stylesheets
│   ├── chatbot.css
│   ├── comparador.css
│   ├── calculadora.css
│   └── whatsapp-float.css
│
├── /properties/            # Data layer
│   └── data.json           # Property database
│
├── /p/                     # Generated property pages (SEO)
├── /og/                    # Generated OG images
├── /tools/                 # Build scripts
│   ├── generate_og_pages.js
│   └── og.config.json
│
├── /snippets/              # Reusable HTML components
├── /allure/, /Milan/, /serena/, /fmia/, /fotoprop/  # Property images
├── /multimedia/            # Generic images
│
├── style.css               # Main stylesheet
├── scripts.js              # Main application script
├── header-footer.js        # Navigation injection
├── service-worker.js       # PWA service worker
├── manifest.json           # PWA manifest
├── reviews.json            # Customer reviews
├── sitemap.xml             # SEO sitemap
└── robots.txt              # Crawler directives
```

---

## Architecture Patterns

### 1. Module Pattern (IIFE)

All JavaScript features use Immediately Invoked Function Expression:

```javascript
(function() {
  'use strict';

  // Private state
  const STATE = {};

  // Private functions
  function helper() { }

  // Public API (optional)
  window.AltorraFeature = {
    method: function() { }
  };
})();
```

### 2. Custom Events for Loose Coupling

```javascript
// Dispatch events
document.dispatchEvent(new CustomEvent('altorra:properties-loaded', {
  detail: { data }
}));

// Listen for events
document.addEventListener('altorra:properties-loaded', handler);
```

**Event Names:**
- `altorra:json-updated` - Data refreshed from server
- `altorra:properties-loaded` - New property cards rendered
- `altorra:compare-updated` - Comparison list changed
- `altorra:fav-update` - Favorites changed
- `altorra:data-updated` - Cache manager detected changes

### 3. localStorage Namespaces

```javascript
// Data caching
'altorra:json:properties/data.json::VERSION'
'altorra:fragment:header.html::VERSION'

// User data
'altorra:favoritos'     // Array of saved properties
'altorra:compare'       // Array of comparison items

// Features
'altorra:ssrc:data'     // Smart search cache
'altorra:chatbot-context'  // Conversation state
'altorra:analytics'     // Event tracking
'altorra:shuffleSeed'   // Daily shuffle seed
```

### 4. Fetch with Fallback

```javascript
async function fetchWithFallback(paths) {
  for (const path of paths) {
    try { return await fetch(path); }
    catch (e) { /* try next */ }
  }
  throw new Error('All paths failed');
}
```

---

## Property Data Schema

```javascript
{
  "id": "101-27",                    // Unique identifier
  "title": "Apartamento exclusivo...", // Display title
  "city": "Cartagena",               // City name
  "type": "apartamento",             // apartamento|casa|lote|oficina
  "operation": "comprar",            // comprar|arrendar|dias
  "price": 5350000000,               // Price in COP
  "beds": 4,                         // Number of bedrooms
  "baths": 5,                        // Number of bathrooms
  "sqm": 240,                        // Square meters
  "image": "/allure/allure.webp",    // Main image
  "images": ["..."],                 // Gallery images array
  "description": "...",              // Full description
  "features": [                      // Amenities list
    "Aire Acondicionado",
    "Balcón",
    "Piscina"
  ],
  "coords": {                        // Map coordinates
    "lat": 10.402567,
    "lng": -75.552746
  },
  "admin_fee": 230000,               // Monthly admin fee
  "neighborhood": "Bocagrande",      // Neighborhood/zone
  "strata": 4,                       // Colombian strata (1-6)
  "garages": 2,                      // Parking spaces
  "floor": 17,                       // Floor number
  "year_built": 2018,                // Construction year
  "featured": 1,                     // Featured flag (0|1)
  "highlightScore": 95,              // Ranking score (0-100)
  "added": "2025-01-15",             // Date added
  "available": 1                     // Availability (0|1)
}
```

---

## Key Features

### Smart Search (`js/smart-search.js`)

**Capabilities:**
- Fuzzy matching with Damerau-Levenshtein algorithm
- Budget parsing: "200m", "1.8 millones", "$1.800.000", ">200m"
- Semantic feature search with synonyms
- Type synonyms: apartamento ↔ apto ↔ flat

**Usage:**
```javascript
// Search triggers on input with 200ms debounce
// Results appear in dropdown below search field
```

### Chatbot (`js/chatbot.js`)

**Features:**
- Context-aware conversation with session persistence
- Natural language budget extraction
- Property recommendations based on user preferences
- WhatsApp handoff with conversation history

**State Management:**
```javascript
const conversationContext = {
  role: null,           // comprador|arrendatario|turista|propietario
  interest: null,       // comprar|arrendar|dias
  propertyType: null,
  zone: null,
  budget: null,
  beds: null,
  // ... more fields
};
```

### Favorites (`js/favoritos.js`)

**Storage:** `localStorage['altorra:favoritos']`

```javascript
// Minimal data stored per favorite
{
  id, title, city, price, image,
  operation, beds, baths, sqm, type,
  addedAt: Date.now()
}
```

### Comparador (`js/comparador.js`)

- Maximum 3 properties
- Must be same operation type
- Auto-highlights best values (lowest price, highest sqm)

### Calculadora (`js/calculadora.js`)

French amortization formula:
```javascript
cuota = monto * (r * (1 + r)^n) / ((1 + r)^n - 1)
// r = monthly rate, n = total payments
```

---

## Code Conventions

### JavaScript Style

```javascript
// Use strict mode
'use strict';

// Configuration objects at top
const CONFIG = {
  enabled: true,
  maxItems: 100
};

// Defensive error handling
try {
  // operation
} catch (e) {
  console.warn('Failed:', e);
  // graceful fallback
}

// Debouncing for performance
const debounce = (fn, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
};
```

### HTML Conventions

```html
<!-- Accessibility -->
<button aria-label="Descripción accesible">

<!-- Custom data attributes -->
<div data-property-id="101-27">

<!-- Skip links -->
<a class="skip-link" href="#contenido">Saltar al contenido</a>

<!-- Semantic structure -->
<section aria-labelledby="section-title">
  <h2 id="section-title">Title</h2>
</section>
```

### CSS Variables

```css
:root {
  --gold: #d4af37;
  --muted: #6b7280;
  /* Add more as needed */
}
```

---

## Caching Strategy

### Data Caching

```javascript
// getJSONCached() in scripts.js
// TTL: 6 hours with background revalidation
const data = await getJSONCached('properties/data.json', {
  ttlMs: 6 * 60 * 60 * 1000,
  revalidate: true
});
```

### Service Worker Strategy

| Resource | Strategy |
|----------|----------|
| HTML/JS | Network-first + cache |
| CSS/Fonts | Stale-while-revalidate |
| Images | Cache-first |

---

## Build & Deployment

### OG Image Generation

```bash
# Generates /og/*.jpg and /p/*.html for each property
node tools/generate_og_pages.js
```

**Auto-detects base URL from:**
1. `tools/og.config.json`
2. `OG_BASE_URL` environment variable
3. `GITHUB_REPOSITORY` environment variable
4. Fallback: `https://altorrainmobiliaria.github.io`

### GitHub Pages

- Hosted at: `altorrainmobiliaria.github.io`
- No build step required (except OG generation)
- Auto-deploys on push to main branch

---

## Common Tasks

### Adding a New Property

1. Add entry to `properties/data.json`
2. Upload images to appropriate directory (`/allure/`, `/Milan/`, etc.)
3. Run `node tools/generate_og_pages.js` to create social sharing assets
4. Commit and push

### Modifying the Chatbot

Key areas in `js/chatbot.js`:
- `CONSULTATION_QUESTIONS` - Question flow configuration
- `conversationContext` - State management
- `processMessage()` - Main message handler
- `generateResponse()` - Response generation

### Updating Styles

- Main styles: `style.css`
- Feature-specific: `css/chatbot.css`, `css/comparador.css`, etc.
- Use CSS variables for consistency

### Adding Analytics Events

```javascript
// In js/analytics.js
AltorraAnalytics.track('event_name', {
  property: 'value'
});
```

---

## Known Issues & Limitations

### Performance
- `chatbot.js` is 114KB - consider code splitting
- No CSS code splitting - all styles loaded on every page
- Some images exceed 500KB

### Security
- Input sanitization inconsistent
- localStorage data not encrypted
- XSS risk in dynamic HTML injection

### Accessibility
- Some ARIA labels missing
- Keyboard navigation incomplete in carousels
- Form errors not announced to screen readers

### Data
- No real-time inventory management
- Reviews are static (not from Google API)
- Some properties missing coordinates

---

## Improvement Priorities

### High Priority
1. Split `chatbot.js` into smaller modules
2. Create centralized `config.js` for constants
3. Add user-facing error notifications
4. Implement critical CSS extraction

### Medium Priority
1. Cache search index for faster load
2. Add property data versioning
3. Improve image compression
4. Add loading states for async operations

### Long-term
1. Backend API integration
2. Map view with Leaflet/Mapbox
3. Admin dashboard
4. Google Analytics with consent

---

## Contact Numbers

| Purpose | Number | Location in Code |
|---------|--------|------------------|
| General | 573002439810 | `js/chatbot.js`, WhatsApp buttons |
| Listings | 573235016747 | Some property pages |

---

## External Dependencies

- **Google Fonts:** Poppins (preconnected)
- **postimg.cc:** Some hero images
- **sharp:** Node.js library for OG image generation

---

## Testing

No automated tests currently. Manual testing recommended for:
- Search functionality with various query formats
- Chatbot conversation flows
- Form validation
- Favorites persistence
- Comparison tool limits
- Mobile responsiveness

---

## Version History

Current build: `2025-09-15d` (in `scripts.js`)

---

*Last updated: November 2025*
