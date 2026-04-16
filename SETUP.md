# AiChat Heart Ecosystem - Setup & Run Guide

## Struktur Proyek

```
aichat-heart-ecosystem/
├── server/                 # Backend REST API (Node.js + Prisma)
│   ├── index.js            # Express server dengan endpoint API
│   ├── alpipeService.js    # AI service layer (placeholder)
│   ├── prisma/
│   │   ├── schema.prisma   # Database models (User, Product, ChatHistory)
│   │   └── migrations/     # Prisma migration files
│   ├── prisma.config.ts    # Prisma runtime config
│   ├── package.json        # Server dependencies
│   └── .env                # Environment variables (DATABASE_URL)
└── client/                 # Frontend React SPA (Vite)
    ├── src/
    │   ├── components/     # React components (ProductInventory, ChatInterface)
    │   ├── services/       # API service layer
    │   ├── hooks/          # Custom React hooks
    │   ├── App.jsx         # Main app component
    │   └── main.jsx        # Entry point
    ├── vite.config.js      # Vite config dengan API proxy
    ├── package.json        # Client dependencies
    └── .env                # Environment variables (VITE_API_BASE_URL)
```

## Prerequisites

- **Node.js:** v24.11.1 atau lebih tinggi
- **npm:** v10+ atau yarn
- **PostgreSQL:** Database Neon (sudah dikonfigurasi di `.env`)

## Setup Awal

### 1. Clone Repository & Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Variables

**Server (server/.env):**
```env
DATABASE_URL="postgresql://neondb_owner:npg_8wrxX3gdflZk@ep-winter-fire-an6zqeeg.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require"
PRISMA_CLIENT_ENGINE_TYPE=binary
PORT=5000
```

**Client (client/.env):** (optional, default: http://localhost:5000)
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Database Sync

```bash
cd server
# Sync Prisma schema dengan database
npx prisma db push --schema prisma/schema.prisma
```

## Menjalankan Aplikasi

### Option 1: Dua Terminal (Recommended untuk Development)

**Terminal 1 - Backend:**
```bash
cd server
npm start
# Server akan berjalan di http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Client akan berjalan di http://localhost:5173
```

### Option 2: Docker (Optional)

Untuk production, semua services dapat di-Dockerize.

## API Endpoints

### Products
- `GET /products` - Dapatkan semua produk
- `GET /products/stock-alert?threshold=5` - Produk dengan stok rendah
- `GET /products/:id` - Detail produk
- `POST /products` - Tambah produk
- `PUT /products/:id` - Update produk
- `PATCH /products/:id/stock` - Update stok
- `DELETE /products/:id` - Hapus produk

### Users & Auth
- `POST /users` - Registrasi user baru
- `GET /users/:id` - Profil user

### Chat & AI
- `POST /ai/chat` - Kirim pesan ke AI
- `GET /chats` - Riwayat chat

## Fitur Utama

### 1. Inventory Management
- ✅ CRUD produk (nama, harga, stok, deskripsi)
- ✅ Stock alert (notifikasi jika stok < threshold)
- ✅ Sorting dan filtering
- ✅ Validasi input menggunakan Zod

### 2. AI Chat
- ✅ User registration & authentication (localStorage)
- ✅ Real-time chat dengan AlPipe AI service
- ✅ Chat history persistence
- ✅ Multi-user support

### 3. Security & Architecture
- ✅ CORS enabled untuk akses cross-origin
- ✅ Password hashing dengan bcryptjs
- ✅ Environment-based credentials (.env)
- ✅ Decoupled SPA + REST API architecture

## Technology Stack

### Backend
- **Runtime:** Node.js v24.11.1
- **Framework:** Express.js
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma v7.7.0
- **Validation:** Zod
- **Auth:** bcryptjs
- **Adapter:** @prisma/adapter-neon (WebSocket untuk serverless)

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Data Fetching:** Fetch API (custom service layer)

## Development Workflow

### Generate Client setelah perubahan schema
```bash
cd server
npm run prisma:generate
```

### Create Migration setelah perubahan schema
```bash
cd server
npm run prisma:migrate
```

### Jalankan Prisma Studio (UI untuk database)
```bash
cd server
npm run prisma:studio
```

## Troubleshooting

### Issue: Database sync error
```bash
# Resolusi dengan force sync
npx prisma db push --force-reset
```

### Issue: API call failed
1. Pastikan backend berjalan di port 5000
2. Check CORS settings di `server/index.js`
3. Verifikasi `VITE_API_BASE_URL` di client

### Issue: Dependencies conflict
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Monitoring & Logs

Semua error API logged ke console server. Untuk production, integrasikan dengan logging service (winston, pino, etc).

## Future Improvements

- [ ] JWT authentication untuk security lebih baik
- [ ] File upload untuk product images
- [ ] Real AI integration (OpenAI, Claude, Gemini)
- [ ] WebSocket untuk real-time updates
- [ ] Database migration history tracking
- [ ] Comprehensive error handling & logging
- [ ] Unit & integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline (GitHub Actions)

## Support

Untuk pertanyaan atau issue, refer ke:
- Prisma Docs: https://www.prisma.io/docs
- React Docs: https://react.dev
- Vite Docs: https://vite.dev
- Tailwind Docs: https://tailwindcss.com

---

**Generated:** 16 April 2026
**Version:** 1.0.0
