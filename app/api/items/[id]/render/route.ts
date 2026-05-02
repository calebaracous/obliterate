import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = `${process.env.ALBION_RENDER_API ?? 'https://render.albiononline.com/v1'}/item/${id}.png?size=217&quality=1`
  return NextResponse.redirect(url, { status: 302 })
}
