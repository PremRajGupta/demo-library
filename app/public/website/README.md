# Demo Library — Website (HTML / CSS / JS / Bootstrap)

Yeh folder **aapki public home page** hai. Isko aap bina React ke edit kar sakte ho.

## Files

| File | Kya edit karein |
|------|------------------|
| `index.html` | Saara content — navbar, hero, about, gallery, contact, footer |
| `css/style.css` | Colors, spacing, custom design |
| `js/main.js` | Slider, gallery popup, stats API (advanced) |
| `assets/logo.png` | Library logo |

## Kaise chalayein

1. **Backend** chalao (port 5000) — stats aur contact API ke liye  
2. **Frontend** chalao: `cd app` → `npm run dev`  
3. Browser: **http://localhost:3000/** — yeh HTML page dikhegi  

## Section add / delete kaise karein

### Naya hero slide
1. `index.html` me `#home` section me ek aur `<div class="hero-slide">` copy karo  
2. Neeche `.hero-dots` me ek aur `<button class="hero-dot">` add karo  

### Gallery image
1. `.row` ke andar naya `<div class="col-sm-6 col-lg-3">` block copy karo  
2. `img src` aur `data-title` change karo  

### Section hataana
Poora `<section id="...">...</section>` block delete karo  
Navbar/footer se uski link bhi hata do  

## Dashboard se content

Agar backend chal raha hai, **Dashboard → Website** se save kiya hua contact/text API se auto-update ho sakta hai (`data-field` wale elements).

Stats (admissions, visitors) hamesha API se aate hain — **300 + active students** formula.

## Login / Dashboard

- **Login:** `/login` (React app)  
- **Dashboard:** login ke baad `/dashboard`  

## Direct file open (optional)

Sirf `index.html` double-click se khologe to stats API kaam nahi karega.  
Hamesha `npm run dev` se kholo.
