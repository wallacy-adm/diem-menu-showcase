import { createClient } from '@supabase/supabase-js';
import { mkdir, writeFile } from 'node:fs/promises';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id,name,emoji,active,order_index,visible,sort_order,created_at')
    .order('order_index', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

async function fetchProducts() {
  const productsResult = await supabase
    .from('products')
    .select('id,category_id,name,description,price,old_price,image_url,image_thumb_url,image_full_url,active,order_index,created_at')
    .order('order_index', { ascending: true });

  if (!productsResult.error) return productsResult.data ?? [];

  const legacyResult = await supabase
    .from('menu_items')
    .select('id,category,name,description,price,old_price,image,visible,sort_order,created_at')
    .order('sort_order', { ascending: true });

  if (legacyResult.error) throw legacyResult.error;

  return (legacyResult.data ?? []).map((item) => ({
    id: item.id,
    category: item.category,
    name: item.name,
    description: item.description,
    price: item.price,
    old_price: item.old_price,
    image_url: item.image,
    image_thumb_url: null,
    image_full_url: item.image,
    active: item.visible,
    order_index: item.sort_order,
    created_at: item.created_at,
  }));
}

async function fetchPromotions() {
  const { data, error } = await supabase
    .from('promotions')
    .select('id,product_id,discount_percent,discount_percentage,start_at,start_date,end_at,end_date,enabled,active,sort_order')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((promo) => ({
    id: promo.id,
    product_id: promo.product_id,
    discount_percent: promo.discount_percent ?? promo.discount_percentage,
    start_at: promo.start_at ?? promo.start_date,
    end_at: promo.end_at ?? promo.end_date,
    enabled: promo.enabled ?? promo.active,
    sort_order: promo.sort_order ?? 0,
  }));
}

async function fetchSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('id,brand_name,slogan,tagline,logo_url,background_url,bg_url,address,instagram,instagram_url,whatsapp,whatsapp_url,footer_note')
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    brand_name: data.brand_name,
    slogan: data.slogan ?? data.tagline,
    logo_url: data.logo_url,
    background_url: data.background_url ?? data.bg_url,
    address: data.address,
    instagram: data.instagram ?? data.instagram_url,
    whatsapp: data.whatsapp ?? data.whatsapp_url,
    footer_note: data.footer_note,
  };
}

async function main() {
  const [categories, products, promotions, settings] = await Promise.all([
    fetchCategories(),
    fetchProducts(),
    fetchPromotions(),
    fetchSettings(),
  ]);

  const snapshot = {
    generated_at: new Date().toISOString(),
    categories,
    products,
    promotions,
    settings,
  };

  await mkdir('public', { recursive: true });
  await writeFile('public/menu_snapshot.json', JSON.stringify(snapshot, null, 2));
  console.log('menu_snapshot generated: public/menu_snapshot.json');
}

main().catch((error) => {
  console.error('Failed to generate menu snapshot:', error);
  process.exit(1);
});
