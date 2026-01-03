import { db } from "./index";
import { products, cards, orders, settings, reviews } from "./schema";
import { eq, sql, desc, and, asc, gte } from "drizzle-orm";

export async function getProducts() {
    return await db.select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        image: products.image,
        category: products.category,
        isActive: products.isActive,
        sortOrder: products.sortOrder,
        stock: sql<number>`count(case when ${cards.isUsed} = false then 1 end)::int`,
        sold: sql<number>`count(case when ${cards.isUsed} = true then 1 end)::int`
    })
        .from(products)
        .leftJoin(cards, eq(products.id, cards.productId))
        .groupBy(products.id)
        .orderBy(asc(products.sortOrder), desc(products.createdAt));
}

// Get only active products (for home page)
export async function getActiveProducts() {
    return await db.select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        image: products.image,
        category: products.category,
        stock: sql<number>`count(case when ${cards.isUsed} = false then 1 end)::int`,
        sold: sql<number>`count(case when ${cards.isUsed} = true then 1 end)::int`
    })
        .from(products)
        .leftJoin(cards, eq(products.id, cards.productId))
        .where(eq(products.isActive, true))
        .groupBy(products.id)
        .orderBy(asc(products.sortOrder), desc(products.createdAt));
}

export async function getProduct(id: string) {
    const result = await db.select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        image: products.image,
        category: products.category,
        stock: sql<number>`count(case when ${cards.isUsed} = false then 1 end)::int`
    })
        .from(products)
        .leftJoin(cards, eq(products.id, cards.productId))
        .where(eq(products.id, id))
        .groupBy(products.id);

    return result[0];
}

// Dashboard Stats
export async function getDashboardStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all delivered orders
    const allOrders = await db.query.orders.findMany({
        where: eq(orders.status, 'delivered')
    });

    const todayOrders = allOrders.filter(o => o.paidAt && new Date(o.paidAt) >= todayStart);
    const weekOrders = allOrders.filter(o => o.paidAt && new Date(o.paidAt) >= weekStart);
    const monthOrders = allOrders.filter(o => o.paidAt && new Date(o.paidAt) >= monthStart);

    const sumAmount = (orders: typeof allOrders) =>
        orders.reduce((sum, o) => sum + parseFloat(o.amount), 0);

    return {
        today: { count: todayOrders.length, revenue: sumAmount(todayOrders) },
        week: { count: weekOrders.length, revenue: sumAmount(weekOrders) },
        month: { count: monthOrders.length, revenue: sumAmount(monthOrders) },
        total: { count: allOrders.length, revenue: sumAmount(allOrders) }
    };
}

// Settings
export async function getSetting(key: string): Promise<string | null> {
    const result = await db.select({ value: settings.value })
        .from(settings)
        .where(eq(settings.key, key));
    return result[0]?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
    await db.insert(settings)
        .values({ key, value, updatedAt: new Date() })
        .onConflictDoUpdate({
            target: settings.key,
            set: { value, updatedAt: new Date() }
        });
}

// Reviews
export async function getProductReviews(productId: string) {
    return await db.select()
        .from(reviews)
        .where(eq(reviews.productId, productId))
        .orderBy(desc(reviews.createdAt));
}

export async function getProductRating(productId: string): Promise<{ average: number; count: number }> {
    const result = await db.select({
        avg: sql<number>`COALESCE(AVG(${reviews.rating}), 0)::float`,
        count: sql<number>`COUNT(*)::int`
    })
        .from(reviews)
        .where(eq(reviews.productId, productId));

    return {
        average: result[0]?.avg ?? 0,
        count: result[0]?.count ?? 0
    };
}

export async function createReview(data: {
    productId: string;
    orderId: string;
    userId: string;
    username: string;
    rating: number;
    comment?: string;
}) {
    return await db.insert(reviews).values({
        ...data,
        createdAt: new Date()
    }).returning();
}

export async function canUserReview(userId: string, productId: string, username?: string): Promise<{ canReview: boolean; orderId?: string }> {
    try {
        // Check if user has a delivered order for this product that hasn't been reviewed yet
        // Check by userId OR username to handle both cases
        const deliveredOrders = await db.select({ orderId: orders.orderId })
            .from(orders)
            .where(and(
                eq(orders.productId, productId),
                eq(orders.status, 'delivered')
            ));

        // Filter orders that belong to this user (by userId or username)
        const userOrders = deliveredOrders.filter(async (order) => {
            const fullOrder = await db.select().from(orders).where(eq(orders.orderId, order.orderId));
            const o = fullOrder[0];
            return o?.userId === userId || (username && o?.username === username);
        });

        // Actually let's simplify - just get all delivered orders for this product by userId
        const ordersByUserId = await db.select({ orderId: orders.orderId })
            .from(orders)
            .where(and(
                eq(orders.userId, userId),
                eq(orders.productId, productId),
                eq(orders.status, 'delivered')
            ));

        // Also check by username if provided
        let ordersByUsername: { orderId: string }[] = [];
        if (username) {
            ordersByUsername = await db.select({ orderId: orders.orderId })
                .from(orders)
                .where(and(
                    eq(orders.username, username),
                    eq(orders.productId, productId),
                    eq(orders.status, 'delivered')
                ));
        }

        // Merge unique orders
        const allOrderIds = new Set([
            ...ordersByUserId.map(o => o.orderId),
            ...ordersByUsername.map(o => o.orderId)
        ]);

        if (allOrderIds.size === 0) {
            return { canReview: false };
        }

        // Check if any of these orders haven't been reviewed
        for (const orderId of allOrderIds) {
            try {
                const existingReview = await db.select({ id: reviews.id })
                    .from(reviews)
                    .where(eq(reviews.orderId, orderId));

                if (existingReview.length === 0) {
                    return { canReview: true, orderId };
                }
            } catch {
                // Reviews table might not exist, so user can review
                return { canReview: true, orderId };
            }
        }

        return { canReview: false };
    } catch {
        // If any error occurs (like reviews table not existing), return false
        return { canReview: false };
    }
}

export async function hasUserReviewedOrder(orderId: string): Promise<boolean> {
    const result = await db.select({ id: reviews.id })
        .from(reviews)
        .where(eq(reviews.orderId, orderId));
    return result.length > 0;
}
