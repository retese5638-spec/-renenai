# Öğrenen AI - P2P Mesh Network

**Canlı Demo:** [https://retese5638-spec.github.io/her-eyi-ret-yapay-zekaya/](https://retese5638-spec.github.io/her-eyi-ret-yapay-zekaya/)

Bu proje, **hiçbir merkezi sunucu veya API (Google, OpenAI, Supabase vb.) kullanmadan**, kullanıcıların tarayıcıları arasında kurulan **P2P (Eşten Eşe)** bağlantı ile çalışan ortak bir yapay zeka hafızasıdır.

"Kendi bulutunu oluştur" felsefesiyle, siteye giren herkes bulutun bir parçası olur.

![P2P AI Network](https://images.unsplash.com/photo-1558494949-efc025708dc7?auto=format&fit=crop&q=80&w=1000)

## 🌐 Nasıl Çalışır? (Teknik Altyapı)

Bu proje **Gun.js** motorunu kullanır.
1.  Siteyi açtığınızda tarayıcınız "Relay Peer" adı verilen halka açık ücretsiz sinyal sunucularına bağlanır.
2.  Diğer kullanıcılarla aranızda şifreli bir **WebRTC** köprüsü kurulur.
3.  Birisi yapay zekaya "Elma nedir?" diye öğrettiğinde, bu veri **anında** ağdaki diğer tüm bilgisayarlara gönderilir.
4.  Veriler `localStorage` üzerinde de yedeklenir, böylece siteyi kapatsanız bile veriler kaybolmaz.

## 🌟 Özellikler

*   **%100 API'siz:** API Key, Login, Şifre gerekmez. Tıkla ve bağlan.
*   **Merkeziyetsiz Bulut:** Veritabanı tek bir şirketin sunucusunda değil, kullanıcıların bilgisayarlarında dağınık halde durur.
*   **Canlı Eşitleme:** Dünyanın öbür ucundaki biri bir soru öğrettiğinde saniyeler içinde ekranınızda belirir.
*   **Öğrenen Algoritma:** Bilmediği soruları sorar, öğrendiğini asla unutmaz (silinmez).
*   **Matematik:** İşlemleri yerel işlemci gücüyle yapar.

## 🚀 GitHub Pages'de Nasıl Yayınlanır?

Bu projeyi `https://retese5638-spec.github.io/her-eyi-ret-yapay-zekaya/` adresinde yayınlamak için şu adımları izleyin:

1.  **Repoyu Oluşturun:** GitHub'da `her-eyi-ret-yapay-zekaya` adında boş bir repo açın.
2.  **Kodları Yükleyin:**
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/retese5638-spec/her-eyi-ret-yapay-zekaya.git
    git push -u origin main
    ```
3.  **Yayınlama (Deploy):**
    Projenin `Settings` -> `Pages` kısmına gidin.
    *   Source: **GitHub Actions** (veya `npm run build` yapıp `dist` klasörünü manuel yüklüyorsanız Branch: `gh-pages` seçin).

    *Alternatif (En Kolay Yöntem):* `gh-pages` paketi ile.
    1. `npm install gh-pages --save-dev`
    2. `package.json` dosyasına şunu ekle: `"deploy": "gh-pages -d dist"`
    3. Terminale yaz: `npm run build && npm run deploy`

## ⚠️ Notlar
*   P2P ağı halka açık kanallar kullanır. Hassas verilerinizi (şifre, kimlik vb.) girmeyiniz.
*   "Kayıtlar asla silinmesin" özelliği gereği, kötü niyetli veriler de ağda yayılabilir, ancak yerel olarak temizleyebilirsiniz.

---
*Powered by GunDB & React*