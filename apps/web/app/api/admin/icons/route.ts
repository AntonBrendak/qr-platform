export const runtime = 'nodejs';

import {NextResponse} from 'next/server';
import {saveOriginalIcon, deleteOriginalIcon} from '../../../../src/server/storage';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    const tenant = (form.get('tenant') as string) || 'default';

    if (!(file instanceof File)) {
      return NextResponse.json({ok: false, error: 'file is required'}, {status: 400});
    }

    const buf = Buffer.from(await file.arrayBuffer());
    // сохраняем как «оригинал», ресайз будет делать выдающий эндпоинт
    await saveOriginalIcon(buf, tenant);

    return NextResponse.json({ok: true, tenant});
  } catch (e: any) {
    return NextResponse.json({ok: false, error: e?.message ?? 'upload_failed'}, {status: 500});
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const tenant = url.searchParams.get('tenant') || 'default';
    await deleteOriginalIcon(tenant);
    return NextResponse.json({ok: true, tenant});
  } catch (e: any) {
    return NextResponse.json({ok: false, error: e?.message ?? 'delete_failed'}, {status: 500});
  }
}