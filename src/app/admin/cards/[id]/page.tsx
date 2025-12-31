import { db } from "@/lib/db"
import { cards } from "@/lib/db/schema"
import { eq, desc, and } from "drizzle-orm"
import { getProduct } from "@/lib/db/queries"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { addCards } from "@/actions/admin"
import { Badge } from "@/components/ui/badge"

export default async function CardsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const product = await getProduct(id)
    if (!product) return notFound()

    // Get Unused Cards
    const unusedCards = await db.select()
        .from(cards)
        .where(and(eq(cards.productId, id), eq(cards.isUsed, false)))
        .orderBy(desc(cards.createdAt))

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Stock: {product.name}</h1>
                    <p className="text-muted-foreground">Manage inventory keys/CDKs for this product.</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold">{unusedCards.length}</div>
                    <div className="text-xs text-muted-foreground">Available</div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Add Stock</CardTitle>
                        <CardDescription>Paste one key per line.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={addCards} className="space-y-4">
                            <input type="hidden" name="product_id" value={id} />
                            <Textarea name="cards" placeholder="KEY-001&#10;KEY-002&#10;KEY-003" rows={10} className="font-mono text-sm" required />
                            <Button type="submit" className="w-full">Import Keys</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Current Inventory</CardTitle>
                        <CardDescription>Unused keys available for sale.</CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[400px] overflow-y-auto space-y-2">
                        {unusedCards.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground text-sm">No stock available.</div>
                        ) : (
                            unusedCards.map(c => (
                                <div key={c.id} className="flex items-center justify-between p-2 rounded bg-muted/40 text-sm font-mono">
                                    <span className="truncate">{c.cardKey}</span>
                                    <Badge variant="outline" className="text-[10px] ml-2">NEW</Badge>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
