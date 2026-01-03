import { getSetting } from "@/lib/db/queries"
import { AnnouncementForm } from "@/components/admin/announcement-form"

export default async function AnnouncementPage() {
    const announcement = await getSetting('announcement')

    return (
        <div className="space-y-6">
            <AnnouncementForm initialContent={announcement} />
        </div>
    )
}
