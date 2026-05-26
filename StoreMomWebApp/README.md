# StoreMom Web Application

ระบบจัดการร้านค้าและคลังสินค้า - Web Application

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Runtime:** Bun
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Prisma Postgres / PostgreSQL
- **ORM:** Prisma 7 with PostgreSQL Adapter

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for the `src/` project layout inspired by `ixartz/Next-js-Boilerplate`.

## Features

- จัดการลูกค้า (CRUD)
- จัดการสินค้า (CRUD) พร้อมติดตาม Stock
- จัดการคำสั่งซื้อ (CRUD)
- Dashboard สรุปข้อมูล
  - จำนวนลูกค้า, สินค้า, คำสั่งซื้อ
  - แจ้งเตือนสินค้าใกล้หมด
  - สรุปยอดขายรายเดือน (เลือกเดือน/ปีได้)
  - สินค้าขายดี Top 5
- Server-side Pagination
- Dark/Light Theme
- Responsive Design

## การติดตั้ง

### 1. ติดตั้ง Dependencies

```bash
bun install
```

### 2. ตั้งค่า Environment

สร้างไฟล์ `.env` จาก `.env.example`:

```bash
cp .env.example .env
```

แก้ไข `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
JWT_SECRET="replace-with-a-long-random-secret"
```

### 3. Generate Prisma Client

```bash
bunx prisma generate
```

### 4. Run Prisma Migration

```bash
bunx prisma migrate dev --name init
```

For Vercel, set `DATABASE_URL` from Vercel Storage > Prisma Postgres before running build or deployment. To apply committed migrations to Vercel Prisma Postgres, run:

```bash
bun run prisma:migrate:deploy
```

### 5. รัน Development Server

```bash
bun run dev
```

เปิด http://localhost:3000

## โครงสร้างโปรเจค

```txt
StoreMomWebApp/
├── src/
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── constants/         # Shared constants
│   ├── libs/              # Library configuration
│   ├── styles/            # Global styles
│   ├── templates/         # Layout/page templates
│   ├── types/             # Shared TypeScript types
│   ├── utils/             # Utilities
│   └── validations/       # Zod schemas
├── prisma/                # Prisma schema and migrations
├── public/                # static assets
└── database/              # legacy SQL scripts
```

## API Endpoints

### Customers
- `GET /api/customers` - รายการลูกค้า (paginated)
- `POST /api/customers` - เพิ่มลูกค้า
- `GET /api/customers/:id` - ดูรายละเอียด
- `PUT /api/customers/:id` - แก้ไข
- `DELETE /api/customers/:id` - ลบ

### Products
- `GET /api/products` - รายการสินค้า (paginated)
- `POST /api/products` - เพิ่มสินค้า
- `GET /api/products/:id` - ดูรายละเอียด
- `PUT /api/products/:id` - แก้ไข
- `DELETE /api/products/:id` - ลบ

### Orders
- `GET /api/orders` - รายการคำสั่งซื้อ (paginated)
- `POST /api/orders` - สร้างคำสั่งซื้อ
- `GET /api/orders/:id` - ดูรายละเอียด
- `PUT /api/orders/:id` - แก้ไขสถานะ
- `DELETE /api/orders/:id` - ลบ

### Stats
- `GET /api/stats/customers` - จำนวนลูกค้า
- `GET /api/stats/products` - จำนวนสินค้า
- `GET /api/stats/orders` - จำนวนคำสั่งซื้อ
- `GET /api/stats/low-stock` - สินค้าใกล้หมด
- `GET /api/stats/available-periods` - เดือน/ปีที่มีข้อมูล
- `GET /api/stats/monthly-sales?month=1&year=2026` - สรุปยอดขายรายเดือน

## Build

```bash
bun run build
```

## License

MIT
