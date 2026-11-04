import { timingSafeEqual } from 'node:crypto';

// 관리자 PIN 확인 (서버 환경변수 ADMIN_PIN과 비교, PIN을 브라우저 코드에 두지 않음)
export default function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ ok: false });

    const expected = process.env.ADMIN_PIN || '';
    const pin = typeof req.body?.pin === 'string' ? req.body.pin : '';
    const a = Buffer.from(pin);
    const b = Buffer.from(expected);
    const ok = expected.length > 0 && a.length === b.length && timingSafeEqual(a, b);

    return res.status(ok ? 200 : 401).json({ ok });
}
