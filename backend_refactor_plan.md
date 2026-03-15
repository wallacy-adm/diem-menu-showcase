# Backend Refactor Plan (Supabase + Snapshot + Admin Alignment)

## 1) Current backend audit (existing state)

### Database tables found
- `settings`
- `menu_items` (legacy products table)
- `categories`
- `promotions`
- `user_roles`
- `orders`
- `order_items`
- `profiles`

### Key columns and model shape
- `menu_items`: category (text), name, description, price, old_price, image, visible, sort_order, featured, highlight_level, image_position_y, image_zoom.
- `categories`: name, emoji, visible, sort_order, highlight, highlight_level.
- `promotions`: product_id (FK to `menu_items.id`), discount_percentage, start_date, end_date, active, sort_order, highlight_level.
- `settings`: brand_name, tagline, logo/bg fields, contact fields.

### Existing relations
- `promotions.product_id -> menu_items.id`
- `order_items.menu_item_id -> menu_items.id`
- `order_items.order_id -> orders.id`

### Existing indexes
- `menu_items(category)`
- `menu_items(featured)`
- extra performance script: `menu_items(visible)`, `menu_items(sort_order)`, `menu_items(category)`.
- Missing from target architecture: `products(category_id)`, `products(active)`, `promotions(product_id)`, `promotions(enabled)`.

### Frontend/backend data flow
- **Admin products** reads/writes `menu_items` directly.
- **Admin categories** reads/writes `categories` directly.
- **Admin promotions** reads/writes `promotions`, joins to `menu_items`.
- **Public menu hooks** consume `menu_items`, `promotions`, `settings` via Supabase client.
- There is currently **no committed `scripts/generateMenuSnapshot.ts`** and no generated `public/menu_snapshot.json` pipeline in repo.

## 2) Target model introduced

Implemented target model support without breaking legacy frontend:

- Added normalized `products` table (`category_id` FK + image URL fields + active/order_index).
- Added compatibility aliases/sync for:
  - `categories`: `active`, `order_index` <-> `visible`, `sort_order`
  - `settings`: `slogan/background_url/instagram/whatsapp` <-> existing legacy columns
  - `promotions`: `discount_percent/start_at/end_at/enabled` <-> legacy columns
- Backfilled `products` from existing `menu_items` data.
- Added sync triggers from `menu_items` to `products` to preserve current admin/frontend behavior.

## 3) Legacy problem handling

### Base64 image storage
- Added a dedicated public storage bucket `product-images` and policies.
- Refactor direction: keep only URLs in DB (`products.image_thumb_url`, `products.image_full_url`, `products.image_url`).
- Existing data is preserved; migration does not delete legacy records.

### Duplicate promotion systems
- `old_price` remains available for UI compatibility.
- Scheduling/discount authority standardized on `promotions` via normalized aliases and indexes.

### Unused/legacy fields
- Legacy fields were not dropped to avoid frontend breakage.
- New model allows gradual deprecation with zero downtime.

## 4) Image delivery optimization

- `products` now supports:
  - `image_thumb_url` (cards/listing)
  - `image_full_url` (modal/details)
  - optional `image_url` (backward compatibility)
- Upload flow recommendation:
  1. upload original to `product-images/full/...`
  2. generate/upload thumbnail to `product-images/thumb/...`
  3. persist both URLs in `products`

## 5) Snapshot integration

- Added script scaffold: `scripts/generateMenuSnapshot.ts`.
- Snapshot output path: `public/menu_snapshot.json`.
- Snapshot includes: `categories`, `products`, `promotions`, `settings`.
- Script supports fallback from `products` to legacy `menu_items` mapping to keep rollout safe.

## 6) Admin panel alignment strategy

Current UI remains functional (still on legacy table names), while backend now supports target model.

Recommended phased rollout:
1. Keep admin writing `menu_items` (current) + trigger sync to `products` (already added).
2. Migrate admin hooks to `products` in a separate frontend-safe PR.
3. Keep snapshot generation as source for public fast loading.

## 7) Performance hardening done

- Added target indexes:
  - `products(category_id)`
  - `products(active)`
  - `promotions(product_id)`
  - `promotions(enabled)`
- Added ordering/access indexes for categories/products where relevant.

## 8) Deliverables

- `backend_refactor_plan.md` (this file)
- `database_schema_final.sql`
- Migration script:
  - `supabase/migrations/20260315120000_backend_refactor_products_snapshot.sql`
- Snapshot script:
  - `scripts/generateMenuSnapshot.ts`
