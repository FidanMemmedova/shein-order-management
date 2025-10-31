# Shein Order Management

Vite + React + TypeScript əsasında hazırlanmış bu layihə Shein sifarişlərini izləmək, idarə etmək və müşahidə etmək üçün sadə idarəetmə paneli təqdim edir. Cədvəl görünüşü MockAPI xidmətindən çəkilən məlumatları göstərir, filtr və axtarış funksiyaları ilə rahat analiz imkanı yaradır. Form səhifəsi isə yeni sifarişlərin əlavə edilməsini təmin edir.

## Əsas xüsusiyyətlər

- **Sifariş cədvəli:** Sifariş tarixi, sahibi, alıcının e-maili, sifariş edilən şəxs, *Sifarişin qiyməti*, təhvil və qaytarılma statusları, eləcə də *Müştəri məlumatı* sütunlarını göstərir.
- **Status idarəsi:** “Təhvil alındı” və “Qaytarılma” checkbox-ları dəyişdirilməzdən əvvəl təsdiqləmə dialoqu açır və nəticə MockAPI-yə yazılır.
- **Müştəri qeydləri:** Cədvəldə ikinci sondan olan sütun müştəri barədə əlavə qeydləri göstərir; eyni sahə redaktə modalında və sifariş formunda dəyişdirilə bilər.
- **Axtarış və filtr:** Sifariş edilən şəxsə görə axtarış, sahibinə görə filtr və tarixə görə sortlama dəstəklənir.
- **Sifariş formu:** Yeni sifariş əlavə edərkən tarix, sahib, email, sifariş edilən şəxs, qiymət, müştəri məlumatı kimi sahələr daxil edilir. Göndəriş uğurlu olduqda modal bildiriş göstərilir.
- **Responsiv dizayn:** Cədvəl və səhifə layout-u geniş ekranlarda tam enə açılır, mobil ekranlarda isə uyğunlaşır.

## Quraşdırma və işə salınma

```bash
git clone <repo-url>
cd SheinOrderManagement-main
npm install
```

- **İnkişaf serveri:** `npm run dev`
- **Lint yoxlaması:** `npm run lint`
- **Prodaksiya build-i:** `npm run build`  
  Build əmri həm TypeScript layihəsini `tsc -b` ilə tərtib edir, həm də Vite vasitəsilə `dist/` qovluğunu yaradır.
- **Prodaksiya öncəsi baxış:** `npm run preview`

> **Qeyd:** Layihə `node >= 18` versiyası ilə test edilib. `npm` 9+ versiyasından istifadə tövsiyə olunur.

## MockAPI haqqında

- Sifarişlər `https://67faa1b08ee14a54262839ee.mockapi.io/orders` son nöqtəsindən, sifariş sahibləri isə `https://67faa1b08ee14a54262839ee.mockapi.io/orderOwners` son nöqtəsindən alınır.
- Sifariş obyektlərinin əhəmiyyətli sahələri:
  - `orderDate` (ISO tarix sətiri)
  - `orderOwner`, `orderEmail`, `orderForName`
  - `orderPrice` (rəqəm)
  - `returnRequest` (boolean)
  - `deliveryReceived` (boolean, defolt `false`)
  - `customerInfo` (string, defolt boş)
- Müəyyən tarixə qədər olan sifarişləri toplu silmək lazımdırsa, MockAPI-lərin REST imkanlarından (GET + DELETE) istifadə oluna bilər. Layihə daxilində bu əməliyyat üçün ayrıca skript yoxdur.

## Layihə strukturu (seçilmiş fayllar)

```
src/
├─ components/
│  ├─ Form/Form.tsx         – Sifariş əlavə etmək üçün forma
│  └─ Table/MyTable.tsx     – Əsas sifariş cədvəli
│     └─ MyTable.css        – Cədvəl üçün stil düzəlişləri
├─ pages/
│  ├─ FormPage.tsx          – Forma səhifəsi (naviqasiya düyməsi ilə)
│  └─ TablePage.tsx         – Cədvəl səhifəsi, konteyner stili `TablePage.css`
├─ App.tsx                  – Router ( / və /table marşrutları )
├─ index.css                – Ümumi qlobal stillər
└─ main.tsx                 – React giriş nöqtəsi
```

## İstifadəçi ssenarisi

1. **Sifariş əlavə et:** Ana səhifədəki formu doldurun və “Göndər” düyməsini sıxın. Uğurlu əməliyyatdan sonra forma təmizlənəcək.
2. **Sifarişləri görüntülə:** “Sifarişlərə keç” düyməsi ilə cədvələ yönləndirin. Sütun başlıqlarından sort və filter tətbiq edin, müştəri qeydlərini ikinci sondan sütunda oxuyun.
3. **Statusu yenilə:** Sətirdəki checkbox-ları işarələdikdə təsdiqləmə pəncərəsi çıxacaq; təsdiq etdikdən sonra MockAPI yenilənir.
4. **Sifarişi redaktə et / sil:** “Redaktə et” düyməsi modalı açır, dəyişiklikləri yadda saxlayın və ya “Sil” düyməsilə sifarişi tam silin.

## Fərdiləşdirmə məsləhətləri

- MockAPI limitlərinə görə çoxlu sayda müraciət edərkən sıx vaxtlı ardıcıl sorğulardan çəkinin.
- Cədvəl ölçülü olduqda, daxili horizontal scroll öz konteynerində aktivləşir və səhifə səviyyəsində scroll yaranmır.
- Əlavə sütunlar və ya yeni form sahələri tələb olunarsa, `Data` interfeysini və MockAPI-yə göndərilən obyektləri uyğun olaraq genişləndirin.

---

Layihə ilə bağlı suallarınız yaranarsa, kodun müvafiq hissəsindəki şərhlərə və ya bu sənədə qayıda bilərsiniz. Uğurlar! 
