import { CallbackContent } from "@/components/callback-content";

export default async function CallbackPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    return <CallbackContent params={params} />
}
