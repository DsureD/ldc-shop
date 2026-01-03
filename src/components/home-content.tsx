'use client'

import { useI18n } from "@/lib/i18n/context"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StarRating } from "@/components/star-rating"

interface Product {
    id: string
    name: string
    description: string | null
    price: string
    image: string | null
    category: string | null
    stockCount: number
    soldCount: number
    rating?: number
    reviewCount?: number
}

interface HomeContentProps {
    products: Product[]
    announcement?: string | null
}

export function HomeContent({ products, announcement }: HomeContentProps) {
    const { t } = useI18n()

    return (
        <main className="container py-8 md:py-16">

            {/* Announcement Banner */}
            {announcement && (
                <section className="mb-8">
                    <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-4">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/50" />
                        <div className="flex items-start gap-3 pl-3">
                            <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{announcement}</p>
                        </div>
                    </div>
                </section>
            )}

            {products.length === 0 ? (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50 mb-4">
                        <svg className="w-8 h-8 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <p className="text-muted-foreground font-medium">{t('home.noProducts')}</p>
                    <p className="text-sm text-muted-foreground/60 mt-2">{t('home.checkBackLater')}</p>
                </div>
            ) : (
                <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product, index) => (
                        <Card
                            key={product.id}
                            className="group overflow-hidden flex flex-col tech-card animate-fade-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Image Section */}
                            <div className="aspect-[4/3] bg-gradient-to-br from-muted/30 to-muted/10 relative overflow-hidden">
                                <img
                                    src={product.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${product.id}`}
                                    alt={product.name}
                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                />
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                {product.category && product.category !== 'general' && (
                                    <Badge className="absolute top-3 right-3 capitalize bg-background/80 backdrop-blur-sm border-border/50 text-foreground">
                                        {product.category}
                                    </Badge>
                                )}
                            </div>

                            {/* Content Section */}
                            <CardContent className="flex-1 p-5">
                                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors duration-300">
                                    {product.name}
                                </h3>
                                {/* Rating */}
                                {product.reviewCount && product.reviewCount > 0 && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <StarRating rating={Math.round(product.rating || 0)} size="sm" />
                                        <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                                    </div>
                                )}
                                <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                                    {product.description || t('buy.noDescription')}
                                </p>
                            </CardContent>

                            {/* Footer Section */}
                            <CardFooter className="p-5 pt-0 flex items-end justify-between gap-3">
                                <div className="shrink-0">
                                    <span className="text-2xl sm:text-3xl font-bold gradient-text">{Number(product.price)}</span>
                                    <span className="text-muted-foreground text-xs sm:text-sm ml-1">{t('common.credits')}</span>
                                </div>
                                <div className="flex flex-col items-end gap-2 min-w-0">
                                    <div className="flex flex-wrap justify-end gap-1.5">
                                        <Badge variant="outline" className="text-xs text-muted-foreground border-border/50 whitespace-nowrap">
                                            {t('common.sold')}: {product.soldCount}
                                        </Badge>
                                        <Badge
                                            variant={product.stockCount > 0 ? "secondary" : "destructive"}
                                            className="text-xs whitespace-nowrap"
                                        >
                                            {product.stockCount > 0 ? `${t('common.stock')}: ${product.stockCount}` : t('common.outOfStock')}
                                        </Badge>
                                    </div>
                                    <Link href={`/buy/${product.id}`}>
                                        <Button
                                            size="sm"
                                            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 whitespace-nowrap"
                                        >
                                            {t('common.viewDetails')}
                                        </Button>
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
