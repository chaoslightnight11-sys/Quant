# Quantfolio

Gizlilik odaklı, tarayıcı içinde çalışan portföy risk analizörü. CSV verileri hiçbir sunucuya gönderilmez.

## Çalıştırma

```bash
npm install
npm run dev
```

## CSV biçimi

Noktalı virgül veya virgül ayracı desteklenir. Zorunlu sütunlar: `sembol`, `değer`, `maliyet`. İsteğe bağlı: `ad`, `sektör`.

## Ürün modeli

- Ücretsiz: portföy özeti, dağılım ve temel risk skoru
- Pro Rapor: PDF rapor, yeniden dengeleme senaryosu ve geçmiş karşılaştırma

Ödeme akışı bilinçli olarak devre dışıdır. Canlı satıştan önce işletme/ödeme hesabı ve mesafeli satış/gizlilik metinleri bağlanmalıdır.

## Yayınlama

`main` dalına gönderilen her commit GitHub Actions ile derlenir ve GitHub Pages'e yayınlanır. Repo ayarlarında **Settings → Pages → Source: GitHub Actions** seçilmelidir.

Lansman metinleri ve satış deneyi için [docs/LAUNCH.md](docs/LAUNCH.md), satış öncesi kontroller için [docs/LEGAL-CHECKLIST.md](docs/LEGAL-CHECKLIST.md) dosyasına bakın.

> Yatırım tavsiyesi değildir. Yalnızca bilgilendirme amaçlıdır.
