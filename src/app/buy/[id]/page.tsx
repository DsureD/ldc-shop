import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { products, cards } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { BuyContent } from "@/components/buy-content"
import { getProductReviews, getProductRating, canUserReview } from "@/lib/db/queries"

export const dynamic = 'force-dynamic'

interface BuyPageProps {
    params: Promise<{ id: string }>
}

export default async function BuyPage({ params }: BuyPageProps) {
    const { id } = await params
    const session = await auth()

    // Get product
    const result = await db
        .select({
            id: products.id,
            name: products.name,
            description: products.description,
            price: products.price,
            image: products.image,
            category: products.category,
            isActive: products.isActive,
        })
        .from(products)
        .where(eq(products.id, id))
        .limit(1)

    const product = result[0]

    // Return 404 if product doesn't exist or is inactive
    if (!product || product.isActive === false) {
        notFound()
    }

    // Get stock count
    const stockResult = await db
        .select()
        .from(cards)
        .where(and(eq(cards.productId, id), eq(cards.isUsed, false)))

    const stockCount = stockResult.length

    // Get reviews (with error handling for new databases)
    let reviews: any[] = []
    let rating = { average: 0, count: 0 }
    let userCanReview: { canReview: boolean; orderId?: string } = { canReview: false }

    try {
        reviews = await getProductReviews(id)
        rating = await getProductRating(id)
        if (session?.user?.id) {
            userCanReview = await canUserReview(session.user.id, id, session.user.username || undefined)
        }
    } catch {
        // Reviews table might not exist yet
    }

    return (
        <BuyContent
            product={product}
            stockCount={stockCount}
            isLoggedIn={!!session?.user}
            reviews={reviews}
            averageRating={rating.average}
            reviewCount={rating.count}
            canReview={userCanReview.canReview}
            reviewOrderId={userCanReview.orderId}
        />
    )
}
