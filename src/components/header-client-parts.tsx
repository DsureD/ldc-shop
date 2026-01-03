'use client'

import Link from "next/link"
import { useI18n } from "@/lib/i18n/context"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ShoppingBag } from "lucide-react"

export function HeaderLogo({ adminName }: { adminName?: string }) {
    const { t } = useI18n()
    const shopName = adminName ? `${adminName}'s ${t('common.appName')}` : t('common.appName')

    return (
        <Link href="/" className="flex items-center gap-2 group text-muted-foreground hover:text-primary transition-colors">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/25 transition-all duration-300">
                <ShoppingBag className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold tracking-tight">{shopName}</span>
        </Link>
    )
}

export function HeaderNav({ isAdmin }: { isAdmin: boolean }) {
    const { t } = useI18n()

    return (
        <>
            {isAdmin && (
                <Link href="/admin" className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
                    {t('common.admin')}
                </Link>
            )}
        </>
    )
}

export function HeaderUserMenuItems({ isAdmin }: { isAdmin: boolean }) {
    const { t } = useI18n()

    return (
        <>
            <DropdownMenuItem asChild>
                <Link href="/orders">{t('common.myOrders')}</Link>
            </DropdownMenuItem>
            {isAdmin && (
                <DropdownMenuItem asChild>
                    <Link href="/admin">{t('common.dashboard')}</Link>
                </DropdownMenuItem>
            )}
        </>
    )
}

export { LanguageSwitcher }
