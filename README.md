# Excel Restructure Tool

أداة ويب بسيطة تحوّل ملفات Excel من هيكل **نوع + معرّف** إلى أعمدة مستقلة لكل نوع.

## المشكلة التي تحلّها

إذا كان عندك ملف Excel بهذا الشكل:

| Type | ID |
|------|----|
| MOBILE NUMBER | 0599899989 |
| NATIONAL ID | 1089124414 |
| EMPLOYEE ID | 51692926 |

تحوّله لهذا الشكل تلقائياً:

| MOBILE NUMBER | NATIONAL ID | EMPLOYEE ID |
|---------------|-------------|-------------|
| 0599899989 | 1089124414 | 51692926 |

## الاستخدام

1. افتح `index.html` في المتصفح
2. ارفع ملف Excel (xlsx / xls / csv)
3. اختر عمود النوع وعمود المعرّف
4. راجع المعاينة
5. حمّل الملف المُعاد هيكلته

## الملفات

```
excel-restructure-tool/
├── index.html   # الواجهة الرئيسية
├── style.css    # التصميم
├── app.js       # المنطق البرمجي
└── README.md
```

## المتطلبات

لا يوجد — يعمل مباشرة في المتصفح بدون تثبيت أي شيء.
يستخدم مكتبة [SheetJS](https://sheetjs.com/) من CDN لقراءة وكتابة ملفات Excel.

## رفع على GitHub Pages

1. ارفع الملفات على GitHub repo
2. اذهب إلى **Settings → Pages**
3. اختر **Deploy from branch → main → / (root)**
4. الرابط سيكون: `https://username.github.io/repo-name`
