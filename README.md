# FAE 隨機抽籤

https://fae-random-picker-web.vercel.app/ （Vercel 專案 `fae-random-picker-web`，推到 main 自動部署）

入口：FAE 入口首頁頂端團隊圖連點三下（`aver-fae` repo 的 `fae.html`）。

## MTBOX 連動

左上角「⚙ MTBOX」打開設定：填 MTBOX IP、帳號、密碼，勾「抽籤後自動切換」。抽到 N 號就送出

    http://<IP>/request=setProfile&profile=<N>   （Basic 帳密，與 mt-camera-control 相同的指令）

- 每個號碼對應的設定檔可改（預設 1→1、2→2、3→3、4→4，可填 1–36）。
- 設定存在瀏覽器 localStorage（鍵 `faePickerMtbox`），不在 repo 裡，換裝置要重填。
- 連線方式：
  - 雲端代理（公網 IP）：頁面 POST 到 `api/mtbox.js`，由 Vercel 轉送，會回報成功／失敗。代理只會送 setProfile 這一個指令，不儲存帳密，也拒絕區網位址。
  - 區網直連（192.168.x.x 等）：Vercel 連不到區網，https 網頁也不能直接連 http 設備，所以改用彈出小視窗直接開指令網址，2.5 秒後自動關閉；無法得知結果，瀏覽器要允許本站彈出視窗。
  - 自動判斷：依 IP 是否為私有網段選擇上面其中一種。

## 檔案

- `index.html`：整個頁面（樣式與程式都在裡面）
- `api/mtbox.js`：MTBOX 雲端代理
- `script.js`、`style.css`、`public/`：舊檔，頁面沒有使用
