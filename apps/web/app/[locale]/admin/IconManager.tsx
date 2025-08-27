'use client';

import {useState} from 'react';

export default function IconManager() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number>(Date.now());
  const [error, setError] = useState<string | null>(null);

  async function upload() {
    if (!file) return;
    setBusy(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      // fd.append('tenant', 'default'); // на будущее — если будут мульти-арендаторы
      const res = await fetch('/api/admin/assets/icons', {method: 'POST', body: fd});
      if (!res.ok) throw new Error((await res.json()).error || 'upload_failed');
      setUpdatedAt(Date.now()); // сброс кэша превью
      setFile(null);
    } catch (e: any) {
      setError(e?.message ?? 'upload_failed');
    } finally {
      setBusy(false);
    }
  }

  async function removeIcon() {
    setBusy(true); setError(null);
    try {
      const res = await fetch('/api/admin/assets/icons', {method: 'DELETE'});
      if (!res.ok) throw new Error((await res.json()).error || 'delete_failed');
      setUpdatedAt(Date.now());
    } catch (e: any) {
      setError(e?.message ?? 'delete_failed');
    } finally {
      setBusy(false);
    }
  }

  const bust = `?ts=${updatedAt}`;

  return (
    <section className="card shadow-sm">
      <div className="card-body">
        <h2 className="h5 mb-3">PWA иконки</h2>

        <div className="mb-3">
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div className="form-text">
            Загрузите квадратный логотип (PNG/SVG/JPG). Мы автоматически сделаем 192/512 и maskable.
          </div>
        </div>

        <div className="d-flex gap-2 mb-3">
          <button className="btn btn-primary" onClick={upload} disabled={!file || busy}>
            {busy ? 'Загрузка...' : 'Загрузить'}
          </button>
          <button className="btn btn-outline-danger" onClick={removeIcon} disabled={busy}>
            Удалить иконки
          </button>
        </div>

        {error ? <div className="alert alert-danger py-2">{error}</div> : null}

        <div className="row g-3">
          <div className="col-auto text-center">
            <div className="mb-1 fw-semibold">192</div>
            <img
              src={`/api/pwa/icon/192${bust}`}
              alt="icon 192"
              width={96}
              height={96}
              style={{imageRendering: 'auto'}}
            />
          </div>
          <div className="col-auto text-center">
            <div className="mb-1 fw-semibold">512</div>
            <img
              src={`/api/pwa/icon/512${bust}`}
              alt="icon 512"
              width={128}
              height={128}
              style={{imageRendering: 'auto'}}
            />
          </div>
          <div className="col-auto text-center">
            <div className="mb-1 fw-semibold">192 maskable</div>
            <img
              src={`/api/pwa/icon/192?maskable=1${bust}`}
              alt="icon 192 maskable"
              width={96}
              height={96}
              style={{imageRendering: 'auto', background: '#eee', borderRadius: 16}}
              title="Отображение с полями (безопасная зона)"
            />
          </div>
          <div className="col-auto text-center">
            <div className="mb-1 fw-semibold">512 maskable</div>
            <img
              src={`/api/pwa/icon/512?maskable=1${bust}`}
              alt="icon 512 maskable"
              width={128}
              height={128}
              style={{imageRendering: 'auto', background: '#eee', borderRadius: 24}}
            />
          </div>
        </div>
      </div>
    </section>
  );
}