'use client'

import { saveProduct } from "@/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea" // Need to install textarea or use Input
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function ProductForm({ product }: { product?: any }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            await saveProduct(formData)
            toast.success("Product saved")
            router.push('/admin')
        } catch (e) {
            toast.error("Failed to save")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{product ? 'Edit Product' : 'New Product'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-4">
                    {product && <input type="hidden" name="id" value={product.id} />}

                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" defaultValue={product?.name} required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="price">Price (Credits)</Label>
                        <Input id="price" name="price" type="number" step="0.01" defaultValue={product?.price} required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" name="category" defaultValue={product?.category} placeholder="e.g. membership" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="image">Image URL</Label>
                        <Input id="image" name="image" defaultValue={product?.image} placeholder="https://..." />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            name="description"
                            defaultValue={product?.description}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={loading}>Save Product</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
