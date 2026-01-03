'use server'

import { setSetting, getSetting } from "@/lib/db/queries"
import { revalidatePath } from "next/cache"

export async function saveAnnouncement(content: string) {
    await setSetting('announcement', content)
    revalidatePath('/')
    return { success: true }
}

export async function getAnnouncement() {
    return await getSetting('announcement')
}
