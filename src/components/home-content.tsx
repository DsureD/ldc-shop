'use client'

import { useI18n } from "@/lib/i18n/context"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Product {
    id: string
    name: string
    description: string | null
    price: string
    image: string | null
    category: string | null
    stockCount: number
    soldCount: number
}

export function HomeContent({ products }: { products: Product[] }) {
    const { t } = useI18n()

    return (
        <main className="container py-8 md:py-12">
            <section className="mb-10 space-y-3 text-center">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">
                    {t('common.appName')}
                </h1>
                <p className="mx-auto max-w-[500px] text-muted-foreground text-sm">
                    {t('home.subtitle')}
                </p>
            </section>

            {products.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-muted-foreground">{t('home.noProducts')}</p>
                    <p className="text-sm text-muted-foreground mt-2">{t('home.checkBackLater')}</p>
                </div>
            ) : (
                <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                        <Card key={product.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                            <div className="aspect-video bg-muted/50 relative">
                                <img
                                    src={product.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${product.id}`}
                                    alt={product.name}
                                    className="object-cover w-full h-full"
                                />
                                {product.category && product.category !== 'general' && (
                                    <Badge className="absolute top-2 right-2 capitalize">
                                        {product.category}
                                    </Badge>
                                )}
                            </div>
                            <CardContent className="flex-1 p-4">
                                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                                <p className="text-muted-foreground text-sm line-clamp-2">
                                    {product.description || t('buy.noDescription')}
                                </p>
                            </CardContent>
                            <CardFooter className="p-4 pt-0 flex items-center justify-between">
                                <div>
                                    <span className="text-2xl font-bold">{Number(product.price)}</span>
                                    <span className="text-muted-foreground ml-1">{t('common.credits')}</span>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex gap-2">
                                        <Badge variant="outline" className="text-muted-foreground">
                                            {t('common.sold')}: {product.soldCount}
                                        </Badge>
                                        <Badge variant={product.stockCount > 0 ? "secondary" : "destructive"}>
                                            {product.stockCount > 0 ? `${t('common.stock')}: ${product.stockCount}` : t('common.outOfStock')}
                                        </Badge>
                                    </div>
                                    <Link href={`/buy/${product.id}`}>
                                        <Button size="sm">{t('common.viewDetails')}</Button>
                                    </Link>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </section>
            )}
        </main>
    )
}
