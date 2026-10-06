# Fidan Business Management

Canlı sayt: **https://fidan-business-management.vercel.app** (köhnə `shein-order-management.vercel.app` ünvanı avtomatik bura yönləndirir).

**Shein** və **iHerb** sifarişlərini bir yerdə izləmək və idarə etmək üçün panel: Vite, React, TypeScript, Ant Design. Məlumatlar **Supabase** (PostgreSQL) bazasında saxlanılır, sifariş sayına limit yoxdur.

## Əsas xüsusiyyətlər

- **Mağazalar:** başlıqdakı «Shein | iHerb» seçimi ilə bölmələr arasında keçid edilir. Hər mağazanın öz cədvəli, statistikası və forması var. Shein qiymətləri dollarla ($), iHerb qiymətləri manatla (₼) göstərilir. Sonuncu açılan mağaza yadda qalır.
- **Giriş və ayrı panellər:** panelə yalnız Supabase-də yaradılmış istifadəçilər daxil ola bilər; hər istifadəçi yalnız öz sifarişlərini görür.
- **Yeni sifariş formu:** mağaza, tarix, e-mail, sifariş edilən şəxs, qiymət və müştəri qeydləri. E-mail və adlar həmin mağazanın əvvəlki sifarişlərindən avtomatik təklif olunur.
- **Müştəri qeydləri:** «Müştəri əlavə et» (+) düyməsi ilə hər müştəri üçün ayrıca qutu açılır (məs. bir bağlamada 4 müştəri = 4 qutu). Qutular həm formda, həm də birbaşa cədvəldə redaktə olunur və cədvəldə avtomatik yadda saxlanılır.
- **Kargo:** cədvəldəki «Kargo» sütununda hər sifariş üçün sonradan Aramex və ya Cargomax seçilir.
- **Statuslar:** «Təhvil alındı» və «Qaytarılma» checkbox-larını dəyişməzdən əvvəl yanlarında qısa təsdiq soruşulur. Qaytarılan sifarişlər cədvəlin sonunda göstərilir.
- **Filtrlər:** «Hamısı / Gözləyir / Təhvil alınıb / Qaytarılma / Kargo seçilməyib» tabları (saylarla birlikdə), axtarış (ə/e, ş/s kimi fərqlərə həssas deyil), tarix aralığı («Bu ay», «Keçən ay» və s.) və kargo filtri. Seçilmiş sifarişlərin sayı və cəmi məbləği dərhal görünür.
- **Aylıq limitlər ($300):** «Limitlər» səhifəsində hər sifariş edilən şəxs üçün Smart Customs üslubunda dairəvi qrafik: istifadə olunan və qalıq limit. Ən çox boş yeri olan əvvəldə, ada görə axtarış var. Bağlama təhvil alındığı aya sayılır; ayın 1-dək təhvil alınmayan bağlama növbəti ayın limitinə keçir (maksimum ehtiyat). Təhvil tarixi «Təhvil alındı» işarələnəndə avtomatik yazılır, redaktədə dəyişdirilə bilər. Shein və iHerb birlikdə sayılır (iHerb ₼ → $ 1.70 ilə). Yeni sifariş formunda adı yazanda həmin şəxsin bu ayki limiti və sifarişin limiti aşıb-aşmadığı göstərilir.
- **Excel:** görünən sifarişlər bir kliklə CSV faylı kimi yüklənir və Excel-də açılır.
- **Redaktə:** sifarişin bütün sahələri, o cümlədən mağazası dəyişdirilə bilər (səhv bölməyə düşən sifarişi o biri mağazaya keçirmək olur).
- **Telefon:** kiçik ekranlarda cədvəl əvəzinə hər sifariş ayrıca kartda göstərilir.

## Ünvanlar

- `/shein`, `/iherb`: sifarişlər
- `/shein/new`, `/iherb/new`: yeni sifariş
- `/limits`: aylıq $300 limitləri (hər iki mağaza birlikdə)
- `/` sonuncu açılan mağazaya, köhnə `/table` ünvanı isə `/shein`-ə yönləndirir.

## Quraşdırma

```bash
npm install
cp .env.example .env   # sonra dəyərləri doldurun
npm run dev
```

### Supabase (bir dəfəlik)

1. [supabase.com](https://supabase.com)-da yeni layihə yaradın.
2. **SQL Editor → New query** bölməsində [`supabase/schema.sql`](supabase/schema.sql) faylını yapışdırıb **Run** edin.
3. **Authentication → Users → Add user → Create new user**: e-mail və parolunuzu yazın, «Auto Confirm User» seçin.
4. **Authentication → Sign In / Providers** bölməsində «Allow new users to sign up» seçimini söndürün. Belə olduqda başqası özünə hesab aça bilməz.
5. **Project Settings → API** bölməsindən Project URL və publishable (anon) açarı götürüb `.env` faylına yazın:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
6. Vercel-də eyni iki dəyişəni **Settings → Environment Variables** bölməsinə əlavə edib layihəni yenidən deploy edin.

### İstifadəçilər

Hər istifadəçinin öz paneli var: sifarişlər, statistika və qazanc yalnız həmin hesaba görünür (Supabase RLS: `user_id = auth.uid()`). Yeni istifadəçi **Authentication → Users → Add user → Create new user** ilə yaradılır («Auto Confirm User» seçili).

Köhnə MockAPI sifarişləri 06.10.2026-da Fidanın hesabına köçürülüb.

## Əmrlər

- `npm run dev`: inkişaf serveri
- `npm run build`: TypeScript yoxlaması və prodaksiya build-i
- `npm run lint`: ESLint
- `npm run preview`: build-ə baxış

## Layihə strukturu

```
supabase/schema.sql              – baza cədvəli və təhlükəsizlik qaydaları
src/
├─ api/orders.ts                 – Supabase CRUD əməliyyatları
├─ components/
│  ├─ AppLayout/                 – başlıq, naviqasiya, çıxış
│  ├─ AuthGate/                  – giriş ekranı
│  ├─ CargoSelect/               – Aramex / Cargomax seçimi
│  ├─ NotesEditor/               – «+» ilə çoxlu müştəri qutuları
│  ├─ OrderForm/                 – forma sahələri və redaktə pəncərəsi
│  ├─ OrdersTable/               – cədvəl, telefon kartları, status təsdiqi
│  ├─ StatCard/                  – statistika kartları
│  ├─ StoreRoute/, StoreSwitch/  – mağaza ünvanları və Shein/iHerb seçimi
├─ lib/                          – Supabase, formatlama, filtrlər, CSV ixracı
├─ pages/FormPage.tsx            – yeni sifariş (/:store/new)
├─ pages/TablePage.tsx           – sifarişlər (/:store)
└─ types/order.ts                – Order tipi, mağazalar, valyuta, kargo seçimləri
```
