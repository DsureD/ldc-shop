import { CallbackContent } from "@/components/callback-content";

export default async function CallbackPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    // This page only runs if the path-based callback failed or wasn't used.
    // It serves as a debug view for missing parameters.
    return <CallbackContent params={params} />
}
