'use server'

import { auth } from '@/lib/auth'
import { createReview, hasUserReviewedOrder } from '@/lib/db/queries'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function submitReview(
    productId: string,
    orderId: string,
    rating: number,
    comment: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: 'Not authenticated' }
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return { success: false, error: 'Invalid rating' }
        }

        // Check if already reviewed
        const alreadyReviewed = await hasUserReviewedOrder(orderId)
        if (alreadyReviewed) {
            return { success: false, error: 'Already reviewed' }
        }

        // Create review (with table creation if needed)
        try {
            await createReview({
                productId,
                orderId,
                userId: session.user.id || '',
                username: session.user.username || session.user.name || 'Anonymous',
                rating,
                comment: comment || undefined
            })
        } catch (error: any) {
            // If reviews table doesn't exist, create it
            if (error.message?.includes('does not exist') ||
                error.code === '42P01' ||
                JSON.stringify(error).includes('42P01')) {
                await db.execute(sql`
                    CREATE TABLE IF NOT EXISTS reviews (
                        id SERIAL PRIMARY KEY,
                        product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                        order_id TEXT NOT NULL,
                        user_id TEXT NOT NULL,
                        username TEXT NOT NULL,
                        rating INTEGER NOT NULL,
                        comment TEXT,
                        created_at TIMESTAMP DEFAULT NOW()
                    )
                `)
                // Retry
                await createReview({
                    productId,
                    orderId,
                    userId: session.user.id || '',
                    username: session.user.username || session.user.name || 'Anonymous',
                    rating,
                    comment: comment || undefined
                })
            } else {
                throw error
            }
        }

        revalidatePath(`/buy/${productId}`)
        revalidatePath(`/order/${orderId}`)

        return { success: true }
    } catch (error) {
        console.error('Failed to submit review:', error)
        return { success: false, error: 'Failed to submit review' }
    }
}
