import { redirect } from "next/navigation";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const orderId = url.searchParams.get('out_trade_no');

    if (orderId) {
        redirect(`/order/${orderId}`);
    }

    redirect('/');
}
