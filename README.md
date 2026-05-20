# 🏛️ Luxury Booking System

[![Version](https://img.shields.io/badge/version-0.1.20-gold.svg?style=flat-square)](https://github.com/)
[![PHP](https://img.shields.io/badge/PHP-8.0%2B-blue.svg?style=flat-square)](https://www.php.net/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow.svg?style=flat-square)](https://developer.mozilla.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-orange.svg?style=flat-square)](https://www.mysql.com/)

A modern web platform for discovering and booking exclusive real estate and premium experiences (castles, private jets, luxury villas). Built entirely on a vanilla technology stack without heavy frameworks, ensuring maximum performance, precise UI control, and a clean codebase.

---

## ✨ Features (Release v0.1.20)

- **Smart Offer Search**: Dynamic filtering by category and an interactive location autocomplete system.
- **Multi-Currency System**: Integration with an external exchange rate API (`open.er-api.com`) to instantly recalculate prices (USD, PLN, EUR) across the site using persistent `localStorage` caching.
- **Interactive Media Slider**: A fully loopable custom photo carousel for property galleries with smooth transitions and click-through protection (`visibility: hidden`).
- **Geolocation Integration**: Dynamic Google Maps embedding that auto-generates custom search URLs with properly encoded geo-data.
- **Authentication & Sessions**: Solid PHP-based user registration and authorization backend, featuring a responsive header layout that adapts immediately to user sessions.
- **Pagination & Optimization**: Managed search results displaying a set limit of properties per page with a "Show more" interactive expansion toggle.

---

## 🛠️ Technology Stack

### Frontend
- **HTML5 & CSS3**: Semantic structuring, responsive Grid/Flexbox layouts, and global design systems handled via native CSS variables.
- **Vanilla JavaScript (ES6+)**: Asynchronous operations (`Fetch API`), component isolation, and clientside persistence layer via `localStorage`.

### Backend & Database
- **PHP 8.0+**: Modular script-based architecture, secure data handling, active session management, and formatted JSON API outputs.
- **MySQL**: Relational database schema with optimized indexing for fast textual lookup of locations and property-benefit associations.

---

## 📁 Project Structure

```text
web-booking-system/
├── css/
│   ├── index.css               # Global styles & main page layouts
│   └── offer_details.css       # Specific layouts for property details
├── index.html                  # Main discovery panel (Search, recommendations, categories)
├── offer_details.html          # Individual property breakdown view
├── js/
│   ├── components.js           # Reusable UI elements (Header, Menubar, Modals)
│   ├── index.js                # Core homepage logic and search API integration
│   └── offer_details.js        # Gallery slider, price calculations, and item rendering
└── php/
    ├── db.php                  # Database driver & core PDO initialization
    ├── check_auth.php          # Session state validation service
    ├── login.php / register.php # User authentication and registration processors
    ├── get_locations.php       # Autocomplete endpoint providing location datasets
    ├── get_recommendation.php  # Content feeder delivering recommended property nodes
    ├── get_searched_offers.php # Full-text search engine handling user queries
    └── get_selected_offer.php  # Deep data gatherer mapping specific objects by ID
