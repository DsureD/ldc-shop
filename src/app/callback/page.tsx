import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function CallbackPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams

    // Try to get order ID from query params first
    let orderId = params.out_trade_no;

    // If not in params, fallback to history or home
    // We do NOT use cookies here to avoid race conditions with multiple tabs

    // Handle array case (if EPay appends param matching ours)
    if (Array.isArray(orderId)) {
        orderId = orderId[0];
    }

    if (orderId && typeof orderId === 'string') {
        redirect(`/order/${orderId}`);
    }

    // Fallback to home if no order ID found
    redirect('/');
}
