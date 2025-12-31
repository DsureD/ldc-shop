import { db } from "@/lib/db";
import { orders, cards } from "@/lib/db/schema";
import { md5 } from "@/lib/crypto";
import { eq, sql } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const params: Record<string, any> = {};
        formData.forEach((value, key) => {
            params[key] = value;
        });

        // Verify Sign
        const sign = params.sign;
        const sorted = Object.keys(params)
            .filter(k => k !== 'sign' && k !== 'sign_type' && params[k] !== '' && params[k] !== null && params[k] !== undefined)
            .sort()
            .map(k => `${k}=${params[k]}`)
            .join('&');

        const mySign = md5(`${sorted}${process.env.MERCHANT_KEY}`);

        if (sign !== mySign) {
            return new Response('fail', { status: 400 });
        }

        if (params.trade_status === 'TRADE_SUCCESS') {
            const orderId = params.out_trade_no;
            const tradeNo = params.trade_no;

            // Find Order
            const order = await db.query.orders.findFirst({
                where: eq(orders.orderId, orderId)
            });

            if (order && order.status === 'pending') {
                // Find Unused Card
                const card = await db.query.cards.findFirst({
                    where: sql`${cards.productId} = ${order.productId} AND ${cards.isUsed} = false`
                });

                if (card) {
                    await db.transaction(async (tx) => {
                        await tx.update(cards)
                            .set({ isUsed: true, usedAt: new Date() })
                            .where(eq(cards.id, card.id));

                        await tx.update(orders)
                            .set({
                                status: 'delivered',
                                paidAt: new Date(),
                                deliveredAt: new Date(),
                                tradeNo: tradeNo,
                                cardKey: card.cardKey
                            })
                            .where(eq(orders.orderId, orderId));
                    });
                } else {
                    // Paid but no stock
                    await db.update(orders)
                        .set({ status: 'paid', paidAt: new Date(), tradeNo: tradeNo })
                        .where(eq(orders.orderId, orderId));
                }
            }
        }

        return new Response('success');
    } catch (e) {
        console.error(e);
        return new Response('error', { status: 500 });
    }
}
