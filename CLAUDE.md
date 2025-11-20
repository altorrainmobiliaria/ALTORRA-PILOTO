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

| File | Purpose | Size |
|------|---------|------|
| `js/config.js` | Centralized configuration | 5.7KB (211 lines) |
| `properties/data.json` | Main property database | 9KB (219 lines) |
| `js/chatbot.js` | **AI chatbot v2.4** (largest module) | 168KB (3,717 lines) |
| `js/smart-search.js` | Advanced search with fuzzy matching | 23KB (526 lines) |
| `scripts.js` | Main application orchestration | 20KB (480 lines) |
| `js/exit-intent.js` | **NEW:** Exit intent popup for lead capture | 13KB (488 lines) |
| `tools/generate_og_pages.js` | Build script for social sharing | 7.2KB |

### Configuration Values

**NEW: All configuration centralized in `js/config.js`**

```javascript
// Access via window.ALTORRA_CONFIG

// Contact Information
ALTORRA_CONFIG.CONTACT.whatsapp = '573002439810';
ALTORRA_CONFIG.CONTACT.email = 'contacto@altorrainmobiliaria.com';
ALTORRA_CONFIG.CONTACT.phone = '+57 300 243 9810';

// Cache Settings
ALTORRA_CONFIG.CACHE.dataTTL = 6 * 60 * 60 * 1000;  // 6 hours
ALTORRA_CONFIG.CACHE.fragmentTTL = 7 * 24 * 60 * 60 * 1000;  // 7 days
ALTORRA_CONFIG.CACHE.revalidationInterval = 60 * 60 * 1000;  // 1 hour

// Pagination & Limits
ALTORRA_CONFIG.PAGINATION.pageSize = 9;
ALTORRA_CONFIG.PAGINATION.maxCompare = 3;
ALTORRA_CONFIG.PAGINATION.maxFavorites = 50;

// Chatbot Settings
ALTORRA_CONFIG.CHATBOT.typingDelay = 800;  // ms
ALTORRA_CONFIG.CHATBOT.messageDelay = 400;  // ms
ALTORRA_CONFIG.CHATBOT.maxHistory = 50;

// Analytics
ALTORRA_CONFIG.ANALYTICS.sessionTimeout = 30 * 60 * 1000;  // 30 minutes

// Helper Methods
ALTORRA_CONFIG.getWhatsAppLink(message);  // Generate WhatsApp URL
ALTORRA_CONFIG.formatPrice(price);         // Format as COP currency
ALTORRA_CONFIG.formatPriceShort(price);    // Shorthand ($5M, $1.2B)
ALTORRA_CONFIG.isBusinessHours();          // Check if currently open
```

---

## Directory Structure

```
ALTORRA-PILOTO/
├── /js/                    # JavaScript modules (15 files, 315KB, 8,222 lines)
│   ├── config.js           # Centralized configuration (211 lines)
│   ├── chatbot.js          # 🤖 AI chatbot v2.4 (3,717 lines, 168KB)
│   ├── smart-search.js     # Fuzzy search engine (526 lines)
│   ├── exit-intent.js      # ⭐ NEW: Exit intent popup (488 lines)
│   ├── listado-propiedades.js  # Property listings (422 lines)
│   ├── comparador.js       # Property comparison (426 lines)
│   ├── favoritos.js        # Favorites system (433 lines)
│   ├── form-validation.js  # Form validation (442 lines)
│   ├── analytics.js        # Google Analytics 4 integration (273 lines)
│   ├── urgency.js          # ⭐ NEW: Urgency/scarcity indicators (247 lines)
│   ├── breadcrumbs.js      # ⭐ NEW: Breadcrumb navigation + schema (250 lines)
│   ├── calculadora.js      # Mortgage calculator (241 lines)
│   ├── utils.js            # Shared utilities (227 lines)
│   ├── cache-manager.js    # Smart caching (165 lines)
│   └── performance.js      # Performance optimizations (154 lines)
│
├── /css/                   # Feature stylesheets (24KB total)
│   ├── chatbot.css         # Chat UI styles (8.8KB)
│   ├── comparador.css      # Comparison table (6.8KB)
│   ├── calculadora.css     # Calculator form (4.1KB)
│   └── whatsapp-float.css  # Floating button (2.9KB)
│
├── /properties/            # Data layer
│   └── data.json           # Property database (9KB)
│
├── /p/                     # Generated property pages (SEO)
├── /og/                    # Generated OG images
├── /tools/                 # Build scripts
│   ├── generate_og_pages.js
│   └── og.config.json
│
├── /snippets/              # Reusable HTML components
│   ├── detalle-share.html  # Property share template
│   └── inject-jsonld.html  # Schema markup
│
├── /allure/, /Milan/, /serena/, /fmia/, /fotoprop/  # Property images
├── /multimedia/            # Generic images
│
├── Pages:                  # HTML pages (22 files)
│   ├── index.html          # Homepage
│   ├── detalle-propiedad.html  # Property detail (DYNAMIC SEO)
│   ├── propiedades-*.html  # Listings (comprar/arrendar/alojamientos)
│   ├── comparar.html       # Comparison tool
│   ├── favoritos.html      # Favorites page
│   ├── contacto.html       # Contact form
│   ├── publicar-propiedad.html  # Property listing form
│   ├── quienes-somos.html  # About page
│   │
│   └── ⭐ Service Pages (NEW):
│       ├── servicios-administracion.html  # Property management (15KB)
│       ├── servicios-juridicos.html       # Legal services (20KB)
│       ├── servicios-contables.html       # Accounting services (22KB)
│       ├── servicios-mantenimiento.html   # Maintenance services (8.6KB)
│       └── servicios-mudanzas.html        # Moving services (8.6KB)
│
├── style.css               # Main stylesheet (13KB)
├── scripts.js              # Main application script (20KB)
├── header-footer.js        # Navigation injection (7.9KB)
├── service-worker.js       # PWA service worker (3.5KB)
├── manifest.json           # PWA manifest
├── reviews.json            # Customer reviews
├── sitemap.xml             # SEO sitemap
└── robots.txt              # Crawler directives
```

---

## Recent Updates (November 2025)

### ✅ Completed Improvements

**🤖 Chatbot Evolution: v2.0 → v2.4** (3,185 → 3,717 lines, 138KB → 168KB)

**Commit 8f54c06 - v2.4:** "Integración completa del sistema de selección de propiedades"
- ✅ Property selection system with checkboxes ("Me interesa")
- ✅ Unified contact flow that includes selected properties
- ✅ Dynamic button text: "Enviar propiedades seleccionadas" vs "Chatear con asesor"
- ✅ Improved visual counter with gradient styling
- ✅ Enhanced checkbox feedback and visibility
- ✅ Consistent WhatsApp handoff with property details

**Commit 862f709 - v2.3:** "Sistema de recomendaciones inteligentes"
- ✅ Smart recommendations when no exact matches found
- ✅ New `analyzePropertyMatch()` function with scoring system
- ✅ Transparent messaging with ✓/✗ symbols for criteria
- ✅ Intelligent scoring: operation +3, type +3, zone +3, budget +2, beds +1
- ✅ Better handling of partial matches

**Commit a4e266c - v2.2:** "Filtro de zona corregido + Sistema de selección"
- ✅ Fixed zone filtering logic
- ✅ Initial property selection system implementation
- ✅ Improved property recommendation accuracy

**Commit 694166b - v2.1:** "Arreglos críticos del flujo consultivo + vocabulario expandido"
- ✅ Fixed rigid conversation flows
- ✅ Expanded synonym vocabulary (50+ mappings)
- ✅ Better context awareness
- ✅ Data contamination prevention
- ✅ Improved type filtering

**⭐ New Features & Modules**

**Commit a404b7b:** "Exit intent popup con captura de leads"
- ✅ **Created `js/exit-intent.js`** (488 lines) - exit intent detection
- ✅ Lead capture form triggered on exit attempt
- ✅ Mobile detection with scroll-based triggers
- ✅ 7-day cooldown period
- ✅ Analytics integration for conversion tracking

**Commit 8ff1208:** "Sistema de urgencia y escasez para propiedades"
- ✅ **Created `js/urgency.js`** (247 lines) - urgency indicators
- ✅ "Nuevo" badge for properties <7 days old
- ✅ "Popular" badge based on view metrics
- ✅ "Pocas disponibles" for low inventory categories
- ✅ Dynamic view count generation with decay factor

**Commit 909d9e8:** "Implementar breadcrumbs con schema markup"
- ✅ **Created `js/breadcrumbs.js`** (250 lines) - navigation breadcrumbs
- ✅ Automatic breadcrumb generation for all pages
- ✅ JSON-LD schema markup for SEO
- ✅ Configurable routes for properties and services

**Commit da68d16:** "Integración completa de Google Analytics 4"
- ✅ Enhanced `js/analytics.js` (164 → 273 lines)
- ✅ Real GA4 integration (Measurement ID: G-EHE7316MST)
- ✅ Event tracking for user interactions
- ✅ Privacy-friendly implementation

**Earlier Improvements**

**Commit 3d876ec:** "Chatbot improvements: Fix rigid flows and add intent detection"
- ✅ Enhanced synonym system with 50+ mappings
- ✅ Added intent detection layer
- ✅ Fixed conversation flow rigidity

**Commit 382d8ff:** "Week 1 Quick Wins: Part 2 - Service pages, dynamic SEO, and form UX"
- ✅ Created 5 new service pages (800+ lines total)
- ✅ Dynamic meta tags in detalle-propiedad.html
- ✅ Enhanced form validation with loading states

**Commit 2581ed8:** "Week 1 Quick Wins: Part 1 - Critical fixes and config centralization"
- ✅ **Created `js/config.js`** - centralized configuration (211 lines)
- ✅ Removed 35 lines of duplicate dead code from scripts.js
- ✅ Fixed typo in footer.html styling

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
'altorra:favoritos'     // Array of saved properties (max 50)
'altorra:compare'       // Array of comparison items (max 3)

// Features
'altorra:ssrc:data'     // Smart search cache
'altorra:chatbot-context'  // Conversation state
'altorra:analytics'     // Event tracking (max 500 events)
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

### 5. Centralized Configuration (NEW)

All constants and settings now live in `js/config.js`:

```javascript
// Instead of scattered constants across files
const WHATSAPP = '573002439810';  // ❌ Old way

// Now use centralized config
ALTORRA_CONFIG.CONTACT.whatsapp;   // ✅ New way
ALTORRA_CONFIG.getWhatsAppLink('Hola'); // Helper method
```

---

## Property Data Schema

```javascript
{
  "id": "101-27",                    // Unique identifier
  "title": "Apartamento exclusivo...", // Display title
  "city": "Cartagena",               // City name
  "type": "apartamento",             // apartamento|casa|lote|oficina|local
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

### Centralized Configuration (`js/config.js`) ⭐ NEW

**Purpose:** Single source of truth for all configuration values

**Exports:** `window.ALTORRA_CONFIG`

**Sections:**
- `CONTACT`: WhatsApp, email, phone, Google Maps Place ID
- `CACHE`: TTLs and revalidation intervals
- `PAGINATION`: Page sizes and limits
- `URLS`: Base URLs and data paths
- `ANALYTICS`: Settings and flags
- `CHATBOT`: Bot name, delays, history limits
- `SEO`: Default titles, descriptions, OG tags
- `BUSINESS_HOURS`: Operating hours by day
- `SERVICES`: Commission rates for sale/rent/admin
- `ZONES`: 11 Cartagena neighborhoods
- `PROPERTY_TYPES`: Property type constants
- `OPERATIONS`: Operation type constants
- `FEATURES`: Feature flags (all enabled)

**Helper Methods:**
```javascript
// Generate WhatsApp URL with pre-filled message
ALTORRA_CONFIG.getWhatsAppLink('Hola, quiero información');

// Generate tel: link
ALTORRA_CONFIG.getPhoneLink();

// Generate mailto: link
ALTORRA_CONFIG.getEmailLink('Consulta desde web');

// Format price as Colombian pesos
ALTORRA_CONFIG.formatPrice(5350000000);  // "$5.350.000.000"

// Format price shorthand
ALTORRA_CONFIG.formatPriceShort(5350000000);  // "$5.35B"

// Check if currently in business hours
ALTORRA_CONFIG.isBusinessHours();  // true/false
```

### Smart Search (`js/smart-search.js`)

**Capabilities:**
- Fuzzy matching with Damerau-Levenshtein algorithm (typo tolerance ≤1)
- Budget parsing: "200m", "1.8 millones", "$1.800.000", ">200m", "250-400m"
- Semantic feature search with English + Spanish synonyms
- Type synonyms: apartamento ↔ apto ↔ flat ↔ apartment
- Auto-learning vocabulary from data.json
- Click-based re-ranking for popularity
- Mobile-optimized dropdown (no iOS zoom)

**Configuration:**
- MIN_CHARS: 2
- MAX_SUGGESTIONS: 12
- DEBOUNCE_MS: 200

**Usage:**
```javascript
// Search triggers on input with 200ms debounce
// Results appear in dropdown below search field
// Supports natural language: "apto 3 hab bocagrande 400m"
```

### Chatbot (`js/chatbot.js`) - Version 2.4 🤖

**Size:** 168KB (3,717 lines) - largest module

**v2.4 Features (Latest):**
- ✅ Property selection system with "Me interesa" checkboxes
- ✅ Unified contact flow (`chatbotSendToAdvisor()`)
- ✅ Selected properties automatically included in WhatsApp message
- ✅ Dynamic button text based on selections
- ✅ Visual counter with gradient styling (purple/blue)
- ✅ Enhanced checkbox feedback
- ✅ Smart property bundling in advisor messages

**v2.3 Features:**
- ✅ Intelligent recommendations system (`analyzePropertyMatch()`)
- ✅ Scoring algorithm for partial matches (operation +3, type +3, zone +3, budget +2, beds +1)
- ✅ Transparent criteria display (✓/✗ symbols)
- ✅ Smart fallback when no exact matches found

**v2.1-v2.2 Features:**
- ✅ Intent detection layer for better understanding
- ✅ Enhanced synonym system (50+ mappings)
- ✅ Fixed rigid conversation flows
- ✅ Data contamination prevention
- ✅ Better type and zone filtering
- ✅ WhatsApp message length limiting
- ✅ Bot stops asking questions after contact is requested

**Core Features:**
- Context-aware conversation with session persistence
- Natural language budget extraction
- Property recommendations based on user preferences
- WhatsApp handoff with conversation history
- Comprehensive synonym understanding
- Multi-property selection and comparison

**State Management:**
```javascript
const conversationContext = {
  role: null,           // comprador|arrendatario|turista|propietario
  interest: null,       // comprar|arrendar|dias
  propertyType: null,   // apartamento|casa|lote|oficina
  zone: null,           // Bocagrande, Manga, Centro, etc.
  budget: null,         // Parsed from natural language
  beds: null,           // 1-5+
  baths: null,
  specificFeatures: [], // Piscina, aire, parqueadero, etc.
  // ... more fields
};
```

**Synonym System:**
```javascript
// Navigation: back, atras, regresar, cancelar, menu, inicio
// Confirmations: si, ok, vale, claro, perfecto, correcto, exacto
// Operations: comprar↔venta, arrendar↔alquiler↔renta, dias↔vacaciones
// Property types: apartamento↔apto, casa↔vivienda, lote↔terreno
// Zones: All 11 Cartagena neighborhoods with variations
// Amenities: piscina↔pool, parqueadero↔garage, aire↔ac, etc.
// Contact: asesor, contacto, whatsapp, telefono, llamar
```

**Key Methods:**
- `normalizeText()` - Lowercase, remove accents, normalize spaces
- `containsKeyword(text, keywords)` - Match any synonym
- `extractBudget(text)` - Parse natural language amounts
- `processMessage(msg)` - Main message handler with intent detection
- `generateResponse()` - Context-aware responses
- `recommendProperties()` - Filter/match based on preferences
- `sendToWhatsApp()` - Handoff with conversation summary

### Favorites (`js/favoritos.js`)

**Storage:** `localStorage['altorra:favoritos']` (max 50 items)

**Features:**
- Heart button toggle on property cards
- Badge counter in navigation header
- Toast notifications on add/remove
- Persistent across sessions

```javascript
// Minimal data stored per favorite
{
  id, title, city, price, image,
  operation, beds, baths, sqm, type,
  addedAt: Date.now()
}
```

**Methods:**
- `isFavorite(propId)` - Check if property is favorited
- `toggle(propertyData)` - Add or remove favorite
- `getFavorites()` - Get all favorites array
- `init()` - Initialize UI elements

### Comparador (`js/comparador.js`)

**Constraints:**
- Maximum 3 properties at once
- Must be same operation type (comprar, arrendar, or dias)
- Auto-highlights best values (lowest price, highest sqm, newest)

**Features:**
- Side-by-side comparison table
- Feature-by-feature comparison
- WhatsApp contact integration
- Toast notifications

**Stored Data:**
```javascript
{
  id, title, price, city, type, beds, baths, sqm,
  garages, strata, admin_fee, year_built,
  neighborhood, features[], image
}
```

### Calculadora (`js/calculadora.js`)

French amortization formula:
```javascript
cuota = monto * (r * (1 + r)^n) / ((1 + r)^n - 1)
// r = monthly interest rate
// n = total number of payments
```

**Features:**
- Monthly payment calculation
- Full amortization schedule table
- Interest vs principal breakdown over time
- Dynamic prepopulation at 70% of property price
- Optional PDF export

### Property Listings (`js/listado-propiedades.js`)

**Modes:** comprar, arrendar, alojamientos (auto-detected from URL)

**Features:**
- Pagination (9 properties per page)
- Advanced filtering:
  - Price range (min/max)
  - Bedrooms (1-5+)
  - Property type
  - Location/zone
  - Amenities search
- Sorting options:
  - Price (low to high, high to low)
  - Newest first
  - Featured first
- WhatsApp contact per property
- Favorites integration
- Responsive grid layout (3 cols → 2 cols → 1 col)

### Form Validation (`js/form-validation.js`) ⭐ ENHANCED

**Recent Improvements:**
- ✅ Loading states with spinner
- ✅ Better error messages
- ✅ Toast notifications for success/error
- ✅ Improved accessibility

**Validation Patterns:**
- Phone: Colombian format (3XXXXXXXXX or +57 3XXXXXXXXX)
- Email: Standard email regex
- Name: Letters and spaces only, min 3 chars
- Required fields marked with visual indicators

**Features:**
- Real-time validation on blur
- Visual feedback (red border for errors)
- Error messages below fields
- Submit button disabled on errors
- Accessible aria-labels and announcements

**Usage:** contacto.html, publicar-propiedad.html

### Urgency & Scarcity (`js/urgency.js`) ⭐ NEW

**Purpose:** Add psychological triggers to increase conversion rates

**Features:**
- **"Nuevo" Badge**: Properties added within last 7 days
- **"Popular" Badge**: High-traffic properties (view-based metrics)
- **"Pocas disponibles" Badge**: Low inventory alert for property categories
- **Dynamic View Counter**: Realistic view counts with decay factor
- **Time-based Decay**: Older properties get reduced view multiplier (0.85 factor)

**Configuration:**
```javascript
const CONFIG = {
  newPropertyDays: 7,           // Days to show "Nuevo" badge
  hotPropertyDays: 14,          // Days to consider for "Popular"
  minViewsPerDay: 15,           // Minimum views per day
  maxViewsPerDay: 120,          // Maximum views per day
  viewDecayFactor: 0.85,        // Decay for older properties
  lowInventoryThreshold: 3      // Threshold for "Pocas disponibles"
};
```

**Key Functions:**
- `isNew(property)` - Check if property is new
- `isHot(property)` - Check if property is popular
- `generateViewCount(property)` - Generate realistic view count
- `hasLowInventory(properties, type, operation)` - Check inventory levels
- `addUrgencyBadges(cardElement, property)` - Add badges to property cards

**Usage:** Automatically called on property listings pages

### Breadcrumbs (`js/breadcrumbs.js`) ⭐ NEW

**Purpose:** Improve navigation UX and SEO with breadcrumb trails

**Features:**
- Automatic breadcrumb generation for all pages
- JSON-LD schema markup for search engines
- Configurable routes for different page types
- Responsive design with mobile optimization
- Accessibility with aria-labels

**Breadcrumb Routes:**
- Properties: index → propiedades-comprar/arrendar/alojamientos → detalle
- Services: index → servicios → specific service page
- Other pages: index → current page

**Schema Markup:**
```javascript
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Inicio",
      "item": "https://altorrainmobiliaria.github.io/"
    },
    // ... more items
  ]
}
```

**Key Functions:**
- `getBreadcrumbsForPage(pathname)` - Get breadcrumb config
- `generateBreadcrumbHTML(breadcrumbs)` - Generate HTML markup
- `generateBreadcrumbSchema(breadcrumbs)` - Generate JSON-LD
- `injectBreadcrumbs()` - Inject into page

**Usage:** Automatically initializes on DOM load

### Exit Intent Popup (`js/exit-intent.js`) ⭐ NEW

**Purpose:** Capture leads when users are about to leave the site

**Features:**
- **Mouse Exit Detection**: Triggers when cursor moves toward browser top (desktop)
- **Mobile Scroll Detection**: Triggers on upward scroll or after time delay
- **Smart Frequency Control**: 7-day cooldown, session tracking
- **Form Integration**: Contact form with validation
- **Analytics Tracking**: Events for popup shown, closed, submitted
- **Persistent Storage**: Remembers user interactions

**Configuration:**
```javascript
const CONFIG = {
  enabled: true,
  cooldownDays: 7,              // Don't show again for 7 days
  threshold: 30,                // Pixels from top to trigger
  delay: 3000,                  // Initial delay before activation
  mobileScrollThreshold: 200,   // Scroll up distance for mobile
  mobileTimeDelay: 45000        // 45s delay for mobile
};
```

**Trigger Conditions:**
- Desktop: Mouse moves to top 30px within 3 seconds of page load
- Mobile: Scroll up 200px OR 45 seconds elapsed
- Only if not shown in last 7 days
- Only if form not previously submitted
- Only once per session

**Key Functions:**
- `hasBeenShownRecently()` - Check cooldown period
- `markAsShown()` - Record popup display
- `markAsSubmitted()` - Permanently disable after submission
- `showPopup()` - Display popup with fade-in
- `closePopup()` - Close with fade-out
- `initExitIntent()` - Initialize detection

**Storage:**
```javascript
localStorage['altorra:exit-intent'] = {
  lastShown: timestamp,
  submitted: boolean
};
```

**Usage:** Automatically initializes on DOM load if enabled

### Dynamic SEO (detalle-propiedad.html) ⭐ NEW

**Dynamic Meta Tags:**
```javascript
// Title format
"{Property Title} en {Venta/Arriendo/Alojamiento} en {Ciudad}"

// Description format
"{Type} en {Operation} - ${Formatted Price}. {Beds} hab, {Baths} baños, {Sqm}m². {Neighborhood}."

// Canonical URL with property ID
"https://altorrainmobiliaria.github.io/detalle-propiedad.html?id={id}"

// Dynamic OG image (first gallery photo)
// Dynamic Twitter Card data
```

---

## Code Conventions

### JavaScript Style

```javascript
// Use strict mode
'use strict';

// Configuration at top (or use ALTORRA_CONFIG)
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

// Use centralized config
const phone = ALTORRA_CONFIG.CONTACT.whatsapp;
const link = ALTORRA_CONFIG.getWhatsAppLink('Hola');
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

<!-- Loading states -->
<button disabled class="loading">
  <span class="spinner"></span> Enviando...
</button>
```

### CSS Variables

```css
:root {
  /* Brand Colors */
  --gold: #d4af37;
  --accent: #ffb400;

  /* Backgrounds */
  --bg: #ffffff;
  --text: #111827;
  --muted: #6b7280;

  /* Layout */
  --header-h: 72px;
  --page-max: 1200px;
  --card-r: 18px;
}
```

---

## Caching Strategy

### Data Caching

```javascript
// getJSONCached() in scripts.js
// TTL: 6 hours with background revalidation
const data = await getJSONCached('properties/data.json', {
  ttlMs: ALTORRA_CONFIG.CACHE.dataTTL,  // 6 hours
  revalidate: true
});
```

**Cache Manager** (`js/cache-manager.js`):
- Automatic change detection via hash comparison
- 5-minute verification interval
- Dispatches `altorra:data-updated` event on changes
- Smart TTL vs polling balance

### Service Worker Strategy

| Resource | Strategy |
|----------|----------|
| HTML/JS | Network-first + cache (always fresh) |
| CSS/Fonts | Stale-while-revalidate |
| Images | Cache-first (use cache, fetch if missing) |

---

## Build & Deployment

### OG Image Generation

```bash
# Generates /og/*.jpg and /p/*.html for each property
node tools/generate_og_pages.js
```

**Auto-detects base URL from:**
1. `tools/og.config.json` (local override)
2. `OG_BASE_URL` environment variable
3. `GITHUB_REPOSITORY` environment variable
4. Fallback: `https://altorrainmobiliaria.github.io`

**Outputs:**
- OG images (1200×630) with property info overlay
- HTML landing pages with full property details
- Canonical URLs and complete metadata

### GitHub Pages

- Hosted at: `altorrainmobiliaria.github.io`
- No build step required (except OG generation)
- Auto-deploys on push to main branch
- Service worker handles caching

---

## Common Tasks

### Adding a New Property

1. Add entry to `properties/data.json` with all required fields
2. Upload images to appropriate directory (`/allure/`, `/Milan/`, etc.)
3. Run `node tools/generate_og_pages.js` to create social sharing assets
4. Test locally to ensure images load
5. Commit and push to deploy

### Modifying the Chatbot

Key areas in `js/chatbot.js` (v2.4, 3,717 lines):
- **Line ~1-50:** Configuration and imports
- **Line ~50-150:** Synonym dictionaries and word mappings (SYNONYMS object)
- **Line ~200-350:** `CONSULTATION_QUESTIONS` - Question flow configuration
- **Line ~400-450:** `conversationContext` - State management object
- **Line ~463-520:** `analyzePropertyMatch()` - v2.3 scoring system
- **Line ~523-568:** `getSmartRecommendationsWithoutZone()` - Smart fallback recommendations
- **Line ~800-1000:** `processMessage()` - Main message handler with intent detection
- **Line ~1500-1700:** `generateResponse()` - Response generation logic
- **Line ~2000-2200:** `recommendProperties()` - Property matching algorithm
- **Line ~2974-3006:** `chatbotSendToAdvisor()` - v2.4 unified contact flow with selections
- **Line ~3457-3491:** Contact case handler - integrates with send to advisor

**v2.4 New Features:**
- Property selection checkboxes system
- `chatbotSendToAdvisor()` - unified WhatsApp contact function
- Dynamic button text based on selections
- Visual counter with gradient styling

**Testing Tips:**
- Clear localStorage to reset conversation: `localStorage.removeItem('altorra:chatbot-context')`
- Test property selection: Click "Me interesa" checkboxes and verify they appear in WhatsApp message
- Test various natural language inputs: "apto 3 hab bocagrande", ">400m", "back", etc.
- Verify synonym system: "casa" should match "vivienda", "apto" should match "apartamento"
- Test recommendation scoring: Try searches with partial matches to see ✓/✗ indicators

### Updating Styles

- **Main styles:** `style.css` (global, header, footer, cards)
- **Feature-specific:** `css/chatbot.css`, `css/comparador.css`, etc.
- **Use CSS variables** for consistency: `var(--gold)`, `var(--muted)`
- **Responsive breakpoints:** 1024px, 920px, 860px, 720px, 560px

### Adding Analytics Events

```javascript
// In any page or module
AltorraAnalytics.track('event_name', {
  property: 'value',
  metadata: { ... }
});

// Examples
AltorraAnalytics.track('property_view', { id: '101-27' });
AltorraAnalytics.track('form_submit', { form: 'contacto' });
```

### Using Centralized Config

```javascript
// Instead of hardcoding values
const msg = `https://wa.me/573002439810?text=${encodeURIComponent(text)}`;

// Use config helper
const msg = ALTORRA_CONFIG.getWhatsAppLink(text);

// Access any config value
const ttl = ALTORRA_CONFIG.CACHE.dataTTL;
const maxFavs = ALTORRA_CONFIG.PAGINATION.maxFavorites;
const zones = ALTORRA_CONFIG.ZONES;  // Array of neighborhoods
```

---

## Known Issues & Limitations

### Performance
- `chatbot.js` is 138KB (3,185 lines) - consider code splitting
- No CSS code splitting - all styles loaded on every page
- Some images exceed 500KB - need compression
- No lazy loading for images in carousels

### Security
- Input sanitization could be more consistent
- localStorage data not encrypted (favorites, context)
- XSS risk in dynamic HTML injection - use `escapeHtml()` from utils.js
- No CSRF protection (not needed for static site, but consider for forms)

### Accessibility
- Some ARIA labels missing in carousels
- Keyboard navigation incomplete in some components
- Form errors not always announced to screen readers
- Color contrast could be improved in some areas

### Data
- No real-time inventory management
- Reviews are static (not from Google API)
- Some properties missing coordinates for map view
- No versioning system for property data changes

---

## Improvement Priorities

### High Priority
1. ~~Split `chatbot.js` into smaller modules~~ - Still needed (now 168KB, 3,717 lines)
2. ~~Create centralized `config.js` for constants~~ ✅ **DONE!**
3. ~~Add urgency/scarcity indicators~~ ✅ **DONE!**
4. ~~Add exit intent popup~~ ✅ **DONE!**
5. Add user-facing error notifications (network failures, etc.)
6. Implement critical CSS extraction
7. Compress images (target <200KB per image)

### Medium Priority
1. ~~Implement breadcrumbs with schema markup~~ ✅ **DONE!**
2. ~~Add Google Analytics 4~~ ✅ **DONE!**
3. Cache search index for faster initial load
4. Add property data versioning and change tracking
5. Improve image compression and lazy loading
6. ~~Add loading states for async operations~~ ✅ **DONE!**
7. Implement keyboard navigation in carousels
8. Add map view to property detail pages

### Long-term
1. Backend API integration for real-time inventory
2. Map view with Leaflet/Mapbox on listings page
3. Admin dashboard for property management
4. Google Analytics with proper consent management
5. Automated testing suite (unit + integration)
6. Progressive image loading (LQIP technique)

---

## Contact Numbers

| Purpose | Number | Location in Code |
|---------|--------|------------------|
| General | 573002439810 | `js/config.js`, `js/chatbot.js`, WhatsApp buttons |
| Listings | 573235016747 | Some property pages (legacy) |

**Note:** Always use `ALTORRA_CONFIG.CONTACT.whatsapp` instead of hardcoding.

---

## External Dependencies

- **Google Fonts:** Poppins (wght: 300, 500, 700, 800) - preconnected for performance
- **postimg.cc:** Hero images and some OG images
- **sharp:** Node.js library for OG image generation (dev dependency only)
- **Google Maps:** Place ID referenced in config (for future map integration)

**No CDN dependencies** - all JavaScript is self-hosted for reliability and performance.

---

## Testing

**Current Status:** No automated tests

**Manual Testing Checklist:**
- [ ] Search functionality with various query formats
  - Budget ranges: "200-400m", ">500m", "1.8b"
  - Property types: "apto", "casa", "flat"
  - Locations: "bocagrande", "manga", "centro"
  - Features: "piscina", "parqueadero", "vista al mar"
- [ ] Chatbot conversation flows
  - All user roles (comprador, arrendatario, turista, propietario)
  - Synonym understanding
  - Intent detection
  - WhatsApp handoff
- [ ] Form validation
  - All fields with valid/invalid data
  - Error messages display correctly
  - Loading states work
  - Toast notifications appear
- [ ] Favorites persistence
  - Add/remove favorites
  - Badge counter updates
  - Data persists across sessions
  - Max 50 limit enforced
- [ ] Comparison tool
  - Max 3 properties enforced
  - Same operation type check
  - Highlights work correctly
- [ ] Mobile responsiveness
  - All breakpoints (1024px, 920px, 860px, 720px, 560px)
  - Touch interactions
  - Menu drawer functionality
  - Search dropdown positioning

**Cache Clearing Utility:** `/limpiar-cache.html` - user-facing tool to manually clear all localStorage

---

## File Statistics

**JavaScript Modules:**
```
Total: 15 files, 8,222 lines, 315KB
  chatbot.js           3,717 lines  168KB  (largest) 🤖 v2.4
  smart-search.js        526 lines   23KB
  exit-intent.js         488 lines   13KB  ⭐ NEW
  scripts.js             480 lines   20KB
  form-validation.js     442 lines   13KB
  favoritos.js           433 lines   14KB
  comparador.js          426 lines   14KB
  listado-propiedades.js 422 lines   15KB
  analytics.js           273 lines    8.9KB  (GA4 enhanced)
  urgency.js             247 lines    7.2KB  ⭐ NEW
  breadcrumbs.js         250 lines    7.0KB  ⭐ NEW
  calculadora.js         241 lines    8.1KB
  utils.js               227 lines    6.4KB
  config.js              211 lines    5.7KB
  cache-manager.js       165 lines    5.4KB
  performance.js         154 lines    4.2KB
  header-footer.js       ~190 lines   7.9KB
```

**CSS Files:**
```
Total: ~1,000+ lines, 37KB
  style.css            ~400 lines   13KB
  chatbot.css          ~220 lines    8.8KB
  comparador.css       ~170 lines    6.8KB
  calculadora.css      ~100 lines    4.1KB
  whatsapp-float.css    ~70 lines    2.9KB
```

**Repository Size:**
```
Total: 58MB
  Core files (HTML/JS/CSS): ~2.5MB
  JavaScript modules: 315KB (15 files)
  Images: 56MB (95 files)
  Property data: 9KB (219 lines)
```

---

## Version History

**Current Versions:**
- Build Version: `2025-09-15d` (scripts.js)
- Cache Version: `2025-09-07.1` (scripts.js)
- Header Cache: `2025-09-07.2` (header-footer.js)
- Config Version: `1.0.0` (config.js)
- Chatbot Version: `v2.4` (js/chatbot.js)
- Analytics: GA4 G-EHE7316MST (js/analytics.js)

**Recent Major Updates:**
- **November 20, 2025:**
  - Chatbot v2.4 with property selection system
  - Exit intent popup (lead capture)
  - Urgency/scarcity indicators
  - Breadcrumbs with schema markup
  - Google Analytics 4 integration
- **November 2025 (earlier):**
  - Centralized configuration system
  - Chatbot v2.0-v2.3 (intent detection, recommendations)
  - Service pages added
  - Form validation enhanced
  - Dynamic SEO for property pages
- **September 2025:** Initial deployment with core features

---

## API Reference

### ALTORRA_CONFIG (Global)

```javascript
// Contact Methods
ALTORRA_CONFIG.getWhatsAppLink(message: string): string
ALTORRA_CONFIG.getPhoneLink(): string
ALTORRA_CONFIG.getEmailLink(subject?: string): string

// Formatting
ALTORRA_CONFIG.formatPrice(price: number): string        // "$5.350.000.000"
ALTORRA_CONFIG.formatPriceShort(price: number): string   // "$5.35B"

// Business Logic
ALTORRA_CONFIG.isBusinessHours(): boolean

// Constants
ALTORRA_CONFIG.CONTACT = { whatsapp, email, phone, googleMapsPlaceId }
ALTORRA_CONFIG.CACHE = { dataTTL, fragmentTTL, revalidationInterval }
ALTORRA_CONFIG.PAGINATION = { pageSize, maxCompare, maxFavorites }
ALTORRA_CONFIG.URLS = { base, dataPath, reviewsPath }
ALTORRA_CONFIG.ANALYTICS = { enabled, sessionTimeout, trackPageViews, ... }
ALTORRA_CONFIG.CHATBOT = { botName, typingDelay, messageDelay, maxHistory }
ALTORRA_CONFIG.SEO = { siteName, defaultTitle, defaultDescription, ... }
ALTORRA_CONFIG.BUSINESS_HOURS = { Lunes, Martes, ..., Domingo }
ALTORRA_CONFIG.SERVICES = { saleCommission, rentalCommission, ... }
ALTORRA_CONFIG.ZONES = [array of neighborhoods]
ALTORRA_CONFIG.PROPERTY_TYPES = [apartamento, casa, lote, oficina, local]
ALTORRA_CONFIG.OPERATIONS = [comprar, arrendar, dias]
ALTORRA_CONFIG.FEATURES = { chatbotEnabled, favoritesEnabled, ... }
```

### Custom Events

```javascript
// Listen for events
document.addEventListener('altorra:json-updated', (e) => {
  console.log('Data refreshed:', e.detail);
});

document.addEventListener('altorra:properties-loaded', (e) => {
  console.log('Properties rendered:', e.detail.count);
});

document.addEventListener('altorra:fav-update', (e) => {
  console.log('Favorites changed:', e.detail);
});

document.addEventListener('altorra:compare-updated', (e) => {
  console.log('Comparison updated:', e.detail);
});

document.addEventListener('altorra:data-updated', (e) => {
  console.log('Cache detected changes');
});
```

---

*Last updated: November 20, 2025*
*Documentation version: 2.0*
*Chatbot version: v2.4*
*Current branch: claude/claude-md-mi7o4mlij8q381pg-014Wa6NUNHPTb6dYj614BR47*
