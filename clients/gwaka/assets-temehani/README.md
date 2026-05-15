# Assets Temehani — GWAKA

Source : 3 WeTransfer envoyés par Temehani le **14 mai 2026** (expire 15 mai 2026).

## Structure

| Dossier | Contenu | Taille | Compte |
|---|---|---|---|
| `_zips-originaux/` | Zips bruts WeTransfer + portrait PNG | 356 MB | 3 |
| `logos-clients/` | Logos des 25 vrais clients (PNG/SVG) | 5.4 MB | 25 |
| `photos-events/` | Photos events GWAKA (iPhone Temehani) | 349 MB | 39 |
| `portrait-temehani/` | Portrait Temehani article Femmes de Polynésie | 2.3 MB | 1 |

## Sources WeTransfer

| URL | Contenu | Date |
|---|---|---|
| `https://we.tl/t-MyogiDSZC95Xrj9F` | 25 logos clients | 14 mai 03:21 UTC |
| `https://we.tl/t-n2DVEPftjootqTQn` | 39 photos events | 14 mai 04:09 UTC |
| `https://we.tl/t-qUq4qe7VFHtXp9yv` | 1 portrait Femmes de Polynésie | 14 mai 04:10 UTC |

## Utilisation sur le site

- **Logos** → `landing-page/public/portfolio/new/images/gwaka/clients/` (normalisés WebP)
- **Photos** → `landing-page/public/portfolio/new/images/gwaka/photos-temehani/` (sélection curée 17 photos resize WebP)
- **Portrait** → `landing-page/public/portfolio/new/images/gwaka/temehani-portrait.webp` (upscalé via FAL Clarity x2 → 1800x1199)

## Notes

- 17/39 photos sélectionnées pour intégration (hero + 6 prestations + 10 galerie)
- 22 photos restantes disponibles si besoin de varier
- 2 photos avec EXIF rotation auto-corrigées : `IMG_2157.JPG` (cocktail) et `IMG_2173.JPG` (sandwiches-salade)
