import { getProducts } from "@/lib/db/queries"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash, Upload } from "lucide-react"
import { deleteProduct } from "@/actions/admin"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function AdminDashboard() {
    const products = await getProducts()

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Manage your products and inventory.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/product/new"><Plus className="mr-2 h-4 w-4" /> New Product</Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Products</CardTitle>
                    <CardDescription>
                        You have {products.length} products listed.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map(product => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <img src={product.image || ''} className="h-10 w-10 object-contain rounded bg-muted/50" alt="" />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {product.name}
                                        <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{product.description}</div>
                                    </TableCell>
                                    <TableCell>{Number(product.price)}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
                                            {product.stock}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/admin/cards/${product.id}`}><Upload className="h-4 w-4" /></Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/admin/product/edit/${product.id}`}><Edit className="h-4 w-4" /></Link>
                                        </Button>
                                        <form action={deleteProduct.bind(null, product.id)} className="inline-block">
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
