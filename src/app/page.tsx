import { getActiveProducts, getSetting, getProductRating } from "@/lib/db/queries";
import { HomeContent } from "@/components/home-content";

export const dynamic = 'force-dynamic';

export default async function Home() {
  let products: any[] = [];
  try {
    products = await getActiveProducts();
  } catch (error: any) {
    const errorString = JSON.stringify(error);
    const isTableMissing =
      error.message?.includes('does not exist') ||
      error.cause?.message?.includes('does not exist') ||
      errorString.includes('42P01') || // PostgreSQL error code for undefined_table
      errorString.includes('relation') && errorString.includes('does not exist');

    if (isTableMissing) {
      console.log("Database initialized check: Table missing. Running inline migrations...");
      const { db } = await import("@/lib/db");
      const { sql } = await import("drizzle-orm");

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10, 2) NOT NULL,
          category TEXT,
          image TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS cards (
          id SERIAL PRIMARY KEY,
          product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          card_key TEXT NOT NULL,
          is_used BOOLEAN DEFAULT FALSE,
          used_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS orders (
          order_id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL,
          product_name TEXT NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          email TEXT,
          status TEXT DEFAULT 'pending',
          trade_no TEXT,
          card_key TEXT,
          paid_at TIMESTAMP,
          delivered_at TIMESTAMP,
          user_id TEXT,
          username TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
        -- Add columns if missing (for existing databases)
        ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
        ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
        -- Settings table for announcements
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT,
          updated_at TIMESTAMP DEFAULT NOW()
        );
        -- Reviews table
        CREATE TABLE IF NOT EXISTS reviews (
          id SERIAL PRIMARY KEY,
          product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          order_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          username TEXT NOT NULL,
          rating INTEGER NOT NULL,
          comment TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);

      products = await getActiveProducts();
    } else {
      throw error;
    }
  }

  // Fetch announcement (with error handling for new databases)
  let announcement: string | null = null;
  try {
    announcement = await getSetting('announcement');
  } catch {
    // Settings table might not exist yet
  }

  // Fetch ratings for each product
  const productsWithRatings = await Promise.all(
    products.map(async (p) => {
      let rating = { average: 0, count: 0 };
      try {
        rating = await getProductRating(p.id);
      } catch {
        // Reviews table might not exist yet
      }
      return {
        ...p,
        stockCount: p.stock,
        soldCount: p.sold || 0,
        rating: rating.average,
        reviewCount: rating.count
      };
    })
  );

  return <HomeContent
    products={productsWithRatings}
    announcement={announcement}
  />;
}
