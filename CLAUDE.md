# CLAUDE.md｜classtools1020 教材網站・進度交接

> 給下一台電腦的 Claude：開工前先讀完這份。老師說「收工」時，把「目前進度」和「下一步」更新後 commit＋push。

## 老師與課程
- 曾瓊瑩（Stacey）老師，115 學年度竹東國中特教組長。全程用繁體中文、口吻幽默溫暖。
- 目前在上：**竹東國中集中式特教班自然科（甲班、乙班）**，單元「光線特勤隊」。
- 稱呼一律用「特教班」，不用暱稱。

## 網站結構（兩個 repo，同一個網域）
| 網址 | repo | 內容 |
|---|---|---|
| classtools1020.github.io/ | classtools1020/classtools1020.github.io（本 repo） | 大門、各任務教材 |
| classtools1020.github.io/light/ | classtools1020/light（會蓋過本 repo 的 /light/） | **上課主選單**（日期＋每一步格子）、`data.js` 課表與每節步驟 |

- 任務四折射教材都在 `light-refract/`：
  - `story.html` 折射偵探事件簿（真實照片＋光光偵探互動簡報，章節 hash：#straw #rule #coin #life #hands #end）
  - `news.html`＋`news3d.js` 光線新聞台（3D 微縮河邊場景，看新聞練習：蘇州阿姨仰漂獲救，改寫自三立新聞網、光明網 2026/8）
  - `mv.html` MV〈折一下 Snap!〉（Gemini 歌聲，逐字對齊，真實照片）
  - `lab.html` 折射實驗室（站 1–6，`#lesson-N` 直接開第 N 站）
  - `story.html?print=student|key`、`news.html?print=student|key`：列印講義（A4 橫式，學生版留空格／解答版）
  - `mv/n3_*.jpg`：新聞台 3D 場景截圖（列印與備援用）
  - `files/R2-refraction.pptx`（第2節 34 頁）、`files/R3-refraction.pptx`（第3節 14 頁）：真實照片＋3D 截圖＋光光偵探，飛入／彈出動畫、按一下揭曉，開場打卡／MV／實驗室／謝幕都有超連結按鈕。主選單用 Office 線上檢視器連結（手機可看）。產生程式：python-pptx＋手寫 p:timing XML（檔名用英文避免下載出錯）
  - `index.html`（任務四首頁）已重做：只放現行教材＋列印下載，舊 Gamma／YouTube 已移除
  - `koko.js` 原創角色「光光偵探」（星星＋偵探帽＋放大鏡）
  - `files/折射_NotebookLM簡報來源.md`（雲端也有一份 Google 文件，給 NotebookLM 產簡報）
- **光線小鎮 `light-town/`（3D 可走動的竹東街景，three.js r160 放在 `light-town/lib/`）**：`#lens` 透鏡任務 5 站（眼鏡行凸/凹、教室投影倒立、操場聚焦、公寓貓眼凹透鏡、公園一滴水）；`#refract` 折射任務 5 站（茶飲吸管、福德祠硬幣、游泳池腿變短、竹東溪撈魚＋真的 Snell 光路、一滴水）。
  - `world.js` 街景（騎樓、鐵窗、水塔、機車、欒樹、電線桿、內灣線、竹東溪、光線國中）；靜態物件用 `mergeStatic` 依材質合併（4000→1200 draw calls）。
  - `main.js` 玩家（光光偵探 3D）、鏡頭、導覽、集章卡、放大鏡疊圖（第二支相機→render target→圓形 shader）、慢電腦自動降畫質。
  - `missions.js` 每站 `{stand, face, tp, build, enter, update, exit}`；水裡「看起來」用 `splitWater`（clipping plane 上下分開，水下那段 y 壓扁＝在水面折一下）。
  - 測試：雲端 swiftshader 一格要 2–5 秒，截圖前設 `window.__dtScale=30`；`__town.startRoute('lens'); __town.goStop(i)` 直接跳站。
- **折射環島搶答** `games/light-refract-quiz.html`：真實台灣地形圖＋小火車沿鐵路開、紅藍兩隊搶答佔站（插旗）、答錯換另一隊、提示鈕、全班一起答、結算明信片。紙張＋墨色風（不要螢光霓虹、不要滿版表情符號），觸控大按鈕，1366×768 一頁不捲動。
- 共用：`games/fx.js`（音效、主選單按鈕、底部導覽列）、`games/checkin.html`（心情打卡／謝幕）

## 上課簡報（新版，紙張＋墨色風）
- 產生程式在 `tools/lessons/`：`kit.py`（共用元件：封面、流程頁、預測卡→打勾、證據照片＋光路線、句型小結、學習單預覽）、`lesson_l1.py`（10/12 透鏡第1節 → `light-lens/files/L1-lens.pptx`）、`lesson_r3.py`（10/14 折射第3節 → `light-refract/files/R3-refraction.pptx`）。
- 透鏡「為什麼」用**牽手走沙灘**比喻（老師聽不懂三稜鏡版，已換掉）：同學＝光、馬路＝空氣（快）、沙灘＝玻璃/水（慢）。`walk.py` 用 Snell 模擬每位同學的位置畫出時間快照；L1 第 10–16 頁＝走沙灘 7 步（斜進→中間厚聚焦→中間薄散開→過焦點上下交換→眼睛直直往回看→三句話）。每頁都有「老師講稿」備忘稿。老師小抄 `light-lens/files/lens-cheatsheet.html`＋PDF 由 `tools/lessons/cheat_gen.py` 產生。說明一律要具體、看得到、摸得到，老師自己要聽得懂。
- 每份第 2 頁是「流程」，點一列可跳頁或開網頁；每頁右上「流程」回去。老師不喜歡一兩行字的 Gamma 簡報。

## 全站通關碼
- 每個 HTML 的 `<head>` 都有 `<script src="/gate.js"></script>`＋`noindex`；`robots.txt` 全站 Disallow。**新增頁面一定要加這兩行。**
- `gate.js` 只存通關碼的 SHA-256；通關碼由老師自己保管，**不要寫進任何 repo 或 CLAUDE.md**（repo 是公開的）。
- 每台電腦輸入一次就記住（localStorage `ct_gate`）。代課包在 hccadaptive.com，有自己的通關碼，不受影響。

## 教學設計鐵則（老師的回饋累積）
1. **用詞**：光「在水面折一下」，再繼續走直線。**不要說「光轉彎」**（學生會以為光走弧線）。鏡片、水滴用「讓光換方向」。
2. **畫面一定要有實物感**：真實照片或 3D 立體場景；偶爾動漫角色點綴。不要純文字、不要扁平示意圖。
3. **原創角色**光光偵探帶路；不要用現成卡通（版權）。
4. **主選單**每一步都要能直接點，不要強迫一步一步。每頁右上「🗂️ 主選單」（/light/）、左上「⬅ 返回」；不要連到網站大門或舊首頁。
4b. 老師上課要 **PPT（有動畫飛入）** 的感覺：網頁互動版＋PPT 版都要有。
5. 投影片：老師最愛的風格是 NotebookLM 產出（插畫＋照片、步驟圖示、底部「重點」橫幅、先猜再翻頁揭曉，可印成講義）。Gamma 簡報先前做得太空，上課不用。
6. 新聞類素材：結局安全、先告訴學生「主角平安」；註明來源；示意圖要標「示意」。
7. 特教原則：分解、替代、重整；先猜再揭曉；答錯用鼓勵語。

## 一條龍自動化工具箱（老師的要求：素材全部自己弄，不要叫老師下載、轉傳）
| 需要 | 做法 |
|---|---|
| 真實感照片 | （workflow 會 commit 任何目的地資料夾）`mcp__Gamma__generate_image`（type: photo，16:9 用 banner）→ 等 completed 拿到 cdn.gamma.app 網址 → 加一行到 `tools/fetch-list.txt`（`目的地路徑 網址`）→ push。GitHub Actions `.github/workflows/fetch-images.yml` 會自動下載並 commit 進 repo → `git pull` 後用 Read 檢查照片。（雲端容器連不到 cdn.gamma.app，所以一定走這條） |
| 3D／立體場景 | three.js（`light-refract/vendor/three.module.min.js`），參考 `light-refract/news3d.js`；要截圖用 Playwright＋swiftshader |
| 動畫 | 網頁用 SVG/CSS/requestAnimationFrame；PPT 用 python-pptx＋手寫 p:timing（參考 scratchpad 的 build.py 寫法：fly/zoom/fade/wipe） |
| 音效 | Python numpy 合成（豎琴、頌缽、海浪…）→ ffmpeg 轉 mp3，參考 `games/sfx/breath/` |
| 地圖 | npm `world-atlas`＋`topojson-client` 取真實海岸線，numpy 畫地形，參考 `games/img/taiwan-map.jpg` |
| Word／PDF | 學習單一律附 PDF（LibreOffice 轉檔），連結優先給 PDF；docx 要符合 OOXML 元素順序 |
| 歌曲 | 寫歌詞＋Gemini 提示詞給老師生成（目前只有這一步需要老師），收到 mp3 後用 sherpa-onnx 中文辨識逐字對齊 |
- 沒有連上的：ChatGPT、Gemini（生圖）、NotebookLM、Claude in Chrome；需要時先用 Gamma。
- 做完一定自己截圖驗證再交給老師。

## 目前進度（2026-10-08）
- 10/2（五）甲班、乙班：只上到吸管實驗（R1 前半）。
- 10/4 完成：光之呼吸站換真實照片（Gamma 生成 6 張）＋真實質感音效＋海浪背景音；所有 Word 學習單修復（結構損毀）並附 PDF；光之環島列車真實地形台灣地圖、每關加提示、熱氣球「開紅燈看看」、修正紫色科學錯誤；光之列車闖關加提示。
- 已完成並上線：事件簿、新聞台 3D 版、兩者的列印講義、折射 PPT 第2節／第3節（動畫＋超連結，待老師用 PowerPoint 實測）、導覽整理（返回／主選單）、MV 新歌、實驗室站號 1–6、主選單改格子、全站「轉彎」改「折一下」。
- **10/16（五）老師請喪假，代課**：
  - **永久保存版（本站）**：`light-refract/1016/`（slides.pptx 28 頁簡報、treasure.pdf、draw.pdf、plan.pdf）；主選單 10/16 三節 SUBA／SUBB6／SUBB7 都有完整步驟。簡報產生程式 `tools/1016/deck2.py`（第二版：預測→證據照片＋光路圖→答案、偵探守則圖、案件整理、句型小結；`python3 deck2.py 輸出.pptx 網頁根網址 PDF資料夾網址`）。
  - **代課包（給代課老師）**：老師的體育網域 `hccadaptive.com/f8f9fc3bd1/`（repo `classtools1020/sports-results` 的 `f8f9fc3bd1/`），網址與內容不出現 classtools；通關碼私下給。頁面只列步驟（**不寫分鐘**），**不要說明文字、不要心情打卡、不要版權字、不要「怎麼做的」說明（例如 MV 的 Gemini／歌詞）**，白底素雅不要 AI 感。10/16 16:00 自動顯示關閉，16:01 排程刪資料夾。縣賽成績網站其他檔案**不要動**（11/6 有全縣活動）。
  - 步驟：甲5 MV→透鏡實驗室→放大鏡尋寶→折射環島搶答｜乙6 MV→光之環島列車→折射環島搶答｜乙7 生活裡的折射→水滴放大鏡→畫卡→MV 再唱。
- 課表（`light/data.js` 的 SCHED）：
  - 10/5（一）甲 第7節：R2 硬幣浮上來了
  - 10/7（三）乙 第4節：R2；甲 第7節：R3 動手做＋生活結案
  - 10/12（一）甲：L1 透鏡
  - 10/14（三）乙：R3
  - 10/16（五）甲5、乙6、乙7：代課（SUBA／SUBB6／SUBB7，見上）
  - 10/21（三）乙 第4節：L1 透鏡

## 下一步（待辦）
- [ ] 老師用學校電腦實測光線小鎮（投影機＋觸控/滑鼠），看順不順。
- [ ] 老師用 NotebookLM 依來源文件產出第 2、3 節投影片（可印講義）。
- [x] 透鏡 L1（10/12）的 Gamma 簡報 → 換成光線小鎮透鏡任務。
- [ ] 選做：MV 裡加入光光偵探探險動作（老師有興趣，尚未開工）。
- [ ] 10/16 16:01：刪除 hccadaptive.com 代課包（sports-results/f8f9fc3bd1/）。

## 本機預覽小技巧
- 雲端容器連不到 github.io；在 repo 外建一個資料夾，用 symlink 放 `light-refract`、`games`、`light`，再 `python3 -m http.server` 預覽。
- Playwright 截圖 3D 頁要加 `--use-angle=swiftshader`；`window.__news3dDT=0.25` 可加速動畫驗證。
