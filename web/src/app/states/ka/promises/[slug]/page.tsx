import { redirect } from 'next/navigation'

export default async function KarnatakaPromiseRedirect({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  redirect(`/states/ka/promises/${slug}`)
}
