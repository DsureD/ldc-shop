'use client'

import { Button } from "@/components/ui/button"
import { refundOrder } from "@/actions/refund"
import { useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function RefundButton({ order }: { order: any }) {
    const [loading, setLoading] = useState(false)

    if (order.status !== 'delivered' && order.status !== 'paid') return null
    if (!order.tradeNo) return null

    const handleRefund = async () => {
        if (!confirm(`Are you sure you want to refund order ${order.orderId}?`)) return

        setLoading(true)
        try {
            await refundOrder(order.orderId)
            toast.success("Refund successful")
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button variant="outline" size="sm" onClick={handleRefund} disabled={loading}>
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Refund"}
        </Button>
    )
}
