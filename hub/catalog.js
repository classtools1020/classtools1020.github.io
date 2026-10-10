/* 總目錄資料：新增教材只要在這裡加一行。
   ty：home 單元首頁｜slide 網頁簡報｜tool 互動教具｜game 遊戲搶答｜mv MV｜ppt PPT｜print 列印｜teacher 老師用
   sec：所在分類（對應左邊選單）；grp：分類裡的小標題；id 同時是縮圖檔名 img/hub/{id}.jpg */
(function () {
  var OV = function (p) { return 'https://view.officeapps.live.com/op/view.aspx?src=' + encodeURIComponent('https://classtools1020.github.io/' + p); };

  window.SECTIONS = [
    { id: 'home', name: '首頁', icon: '🏡' },
    { id: 'temp', name: '溫度特勤隊', icon: '🌡️', note: '10/19 起・IEP 2-1 量溫度、讀整數、照步驟記錄', color: '#d9785f' },
    { id: 'light', name: '光線特勤隊', icon: '🔦', note: '光走直線・反射・顏色・折射・透鏡', color: '#e0a83a',
      groups: ['3D 大冒險', '任務一・光走直線', '任務二・光的反射', '任務三・光與顏色', '任務四・光的折射', '任務五・透鏡', '中秋特別任務'] },
    { id: 'games', name: '遊戲搶答', icon: '🎲', note: '全班分隊、搶答、闖關', color: '#6f9e6a', byType: 'game' },
    { id: 'mv', name: 'MV 劇場', icon: '🎵', note: '上課一起唱', color: '#8a7fc0', byType: 'mv' },
    { id: 'class', name: '開場與收心', icon: '🌿', note: '心情打卡、呼吸、謝幕', color: '#5f9ea0' },
    { id: 'print', name: '列印與 PPT', icon: '🖨️', note: '講義、學習單、教案、投影片', color: '#7b8fa6', byType: ['print', 'ppt'] },
    { id: 'archive', name: '舊教材區', icon: '📦', note: '芎林時期與早期版本，網址都還能用', color: '#a08a6a' }
  ];

  window.TYPES = {
    home: '單元首頁', slide: '網頁簡報', tool: '互動教具', game: '遊戲搶答', mv: 'MV', ppt: 'PPT', print: '列印', teacher: '老師用'
  };

  var T = [];
  function add(sec, grp, id, ty, t, s, u, acts) { T.push({ sec: sec, grp: grp, id: id, ty: ty, t: t, s: s, u: u, acts: acts || [] }); }

  /* ===== 溫度特勤隊 ===== */
  var G = '單元入口';
  add('temp', G, 'temp-home', 'home', '溫度特勤隊首頁', '六節課、教具、列印一頁看完', '/temp/');
  G = '六節課';
  var TL = ['手會騙人嗎？', '額溫槍出動！', '溫度計的紅線', '三杯水排排站', '校園溫度巡邏', '出勤大挑戰'];
  TL.forEach(function (name, i) {
    var n = i + 1, acts = [['PPT', OV('temp/files/T' + n + '-temp.pptx')], ['下載 PPT', '/temp/files/T' + n + '-temp.pptx']];
    acts.push(n < 6 ? ['講義＋學習單', '/temp/files/T' + n + '-print.pdf'] : ['檢核表', '/temp/files/T6-check.pdf']);
    add('temp', G, 'temp-t' + n, 'slide', 'T' + n + ' ' + name, '網頁簡報・先猜再揭曉', '/temp/t' + n + '.html', acts);
  });
  G = '互動教具';
  add('temp', G, 'temp-bowls', 'tool', '三碗水', '手會騙人？冷熱感覺實驗', '/temp/bowls.html');
  add('temp', G, 'temp-forehead', 'tool', '額溫槍出動', '六步驟練習＋讀大數字', '/temp/forehead.html', [['讀大數字考考你', '/temp/forehead.html#quiz']]);
  add('temp', G, 'temp-thermo', 'tool', '溫度計實驗室', '看紅線、一起數、三杯水記錄', '/temp/thermo.html#see', [['考考你', '/temp/thermo.html#quiz'], ['三杯水排排站', '/temp/thermo.html#record']]);
  add('temp', G, 'temp-campus', 'tool', '溫度探險校園', '竹東國中地圖・巡邏記錄卡', '/temp/campus.html');
  add('temp', '遊戲', 'temp-quiz', 'game', '溫度環島搶答', '紅藍兩隊搶答佔站', '/games/temp-quiz.html');
  for (var n = 1; n <= 5; n++) add('temp', '列印', 'temp-p' + n, 'print', 'T' + n + ' 講義＋學習單', 'PDF・A4', '/temp/files/T' + n + '-print.pdf');
  add('temp', '列印', 'temp-p6', 'print', 'T6 實作評量檢核表', 'PDF・老師用', '/temp/files/T6-check.pdf');

  /* ===== 光線特勤隊 ===== */
  G = '3D 大冒險';
  add('light', G, 'light-town', 'tool', '光線小鎮', '3D 竹東街景・透鏡 5 站＋折射 5 站', '/light-town/', [['透鏡任務', '/light-town/#lens'], ['折射任務', '/light-town/#refract']]);
  add('light', G, 'dispatch', 'game', '光線特勤隊・出勤！', '自己開車辦案、3D 證據卡、抽夥伴卡', '/games/light-dispatch.html');

  G = '任務一・光走直線';
  add('light', G, 'shadow-home', 'home', '任務一首頁', '光走直線・影子出現', '/light-shadow/');
  add('light', G, 'shadow-slides', 'slide', '任務一簡報', '光走直線', '/light-shadow/lesson1-slides.html');
  add('light', G, 'shadow-game', 'game', '光之國大富翁', '光走直線、影子出現', '/games/light-shadow.html');
  add('light', G, 'shadow-plan', 'print', '任務一教案', 'PDF', '/light-shadow/lesson1-plan.pdf');
  add('light', G, 'shadow-ws', 'print', '任務一學習單', 'PDF', '/light-shadow/lesson1-worksheet.pdf');

  G = '任務二・光的反射';
  add('light', G, 'refl-home', 'home', '任務二首頁', '光的反射', '/light-reflection/');
  add('light', G, 'refl-photos', 'slide', '反射魔法・照出倒影', '真實照片體驗', '/light-reflection/photos.html');
  add('light', G, 'refl-stage', 'tool', '光的舞臺', '反射示範', '/light-reflection/stage.html');
  add('light', G, 'refl-lab', 'tool', '反射互動實驗室', '鏡子讓光換方向', '/games/light-reflection-lab.html');
  add('light', G, 'refl-mono', 'game', '光的反射大富翁', '分隊擲骰', '/games/light-reflection-monopoly.html');
  add('light', G, 'refl-race', 'game', '光的反射大賽車', '搶答賽車', '/games/light-reflection-race.html');
  add('light', G, 'refl-ws', 'print', '反射學習單', '網頁版・可列印', '/light-reflection/worksheet.html');

  G = '任務三・光與顏色';
  add('light', G, 'color-home', 'home', '任務三首頁', '光與顏色', '/light-color/');
  add('light', G, 'color-recap', 'slide', '30 秒反射複習', '開場暖身', '/light-color/reflect-recap.html');
  add('light', G, 'color-photos', 'slide', '真實照片體驗館', '光與顏色', '/light-color/photos.html');
  add('light', G, 'color-mix', 'tool', '混光魔法・白光大解密', '紅綠藍混出白光', '/light-color/mix-magic.html');
  add('light', G, 'color-stage', 'tool', '混光魔法・光的舞臺', '舞台燈混色', '/light-color/stage.html');
  add('light', G, 'color-newton', 'tool', '牛頓色盤', '轉一轉變白色', '/light-color/newton-disc.html');
  add('light', G, 'color-lab', 'tool', '光與顏色實驗室', '互動實驗', '/games/light-color-lab.html');
  add('light', G, 'color-mixer', 'tool', '混色大挑戰', '光的三原色', '/games/color-mixer.html');
  add('light', G, 'color-camera', 'tool', '顏色魔法相機', '用鏡頭找顏色', '/light-color/camera.html');
  add('light', G, 'color-personal', 'tool', '個人色彩鑑定相機', '你適合哪個顏色？', '/light-color/personal-color.html');
  add('light', G, 'color-detective', 'game', '顏色偵探大挑戰', '真實照片破案', '/light-color/detective.html');
  add('light', G, 'color-close', 'slide', '顏色偵探・結案報告', '收尾整理', '/light-color/case-close.html');
  add('light', G, 'color-quiz', 'game', '顏色大搶答', '分隊搶答', '/games/light-color-quiz.html');
  add('light', G, 'color-train', 'game', '光之列車・顏色闖關', '闖關＋提示', '/games/light-train.html');
  add('light', G, 'color-taiwan', 'game', '光之環島列車', '真實地形台灣地圖', '/games/taiwan-train.html');
  add('light', G, 'color-p1', 'print', '光與顏色・三堂教案台詞', 'PDF', '/light-color/files/01_光與顏色_三堂教案台詞_SEL融入版.pdf');
  add('light', G, 'color-p2', 'print', '混光魔法學習單（照片版）', 'PDF', '/light-color/files/04_混光魔法_學習單_照片版.pdf');
  add('light', G, 'color-p3', 'print', '混光魔法・教師逐格帶法包', 'PDF', '/light-color/files/05_混光魔法_教師逐格帶法包.pdf');
  add('light', G, 'color-p4', 'print', '顏色偵探結案報告單（照片版）', 'PDF', '/light-color/files/06_顏色偵探_結案報告單_照片版.pdf');

  G = '任務四・光的折射';
  add('light', G, 'refr-home', 'home', '任務四首頁', '光的折射', '/light-refract/');
  add('light', G, 'refr-story', 'slide', '折射偵探事件簿', '吸管、硬幣、生活裡的折射', '/light-refract/story.html', [['學生講義', '/light-refract/story.html?print=student'], ['解答版', '/light-refract/story.html?print=key']]);
  add('light', G, 'refr-news', 'slide', '光線新聞台', '3D 河邊場景・看新聞練習', '/light-refract/news.html', [['學生講義', '/light-refract/news.html?print=student']]);
  add('light', G, 'refr-lab', 'tool', '折射實驗室', '吸管真的斷了嗎？站 1–6', '/light-refract/lab.html');
  add('light', G, 'refr-3d', 'tool', '3D 吸管杯', '轉來轉去看折射', '/light-refract/3d.html');
  add('light', G, 'refr-quiz', 'game', '折射環島搶答', '小火車環島、插旗佔站', '/games/light-refract-quiz.html');
  add('light', G, 'refr-r2', 'ppt', '折射第 2 節 PPT', '34 頁・動畫＋超連結', OV('light-refract/files/R2-refraction.pptx'), [['下載', '/light-refract/files/R2-refraction.pptx']]);
  add('light', G, 'refr-r3', 'ppt', '折射第 3 節 PPT', '14 頁・動畫＋超連結', OV('light-refract/files/R3-refraction.pptx'), [['下載', '/light-refract/files/R3-refraction.pptx']]);
  add('light', G, 'refr-ws', 'print', '折射學習單（照片版）', '勾選式', '/light-refract/files/04_折射_學習單_照片版.pdf', [['網頁版', '/light-refract/worksheet.html']]);
  add('light', G, 'refr-printr2', 'print', '折射動手做・列印包', '一次印好', '/light-refract/print-r2.html');
  add('light', G, 'refr-plan', 'print', '折射三堂教案台詞', 'PDF', '/light-refract/files/01_折射_三堂教案台詞.pdf');

  G = '任務五・透鏡';
  add('light', G, 'lens-home', 'home', '任務五首頁', '透鏡', '/light-lens/');
  add('light', G, 'lens-detective', 'game', '微小世界探險隊', '竹東校園地圖＋放大鏡找線索', '/light-lens/detective.html');
  add('light', G, 'lens-walk', 'tool', '牽手走沙灘', '3D 動畫：為什麼會聚焦', '/light-lens/walk.html');
  add('light', G, 'lens-lab', 'tool', '透鏡實驗室', '放大鏡只會把東西變大嗎？', '/light-lens/lab.html');
  add('light', G, 'lens-l1', 'ppt', '透鏡第 1 節 PPT', '走沙灘 7 步', OV('light-lens/files/L1-lens.pptx'), [['下載', '/light-lens/files/L1-lens.pptx']]);
  add('light', G, 'lens-ws', 'print', '透鏡第 1 節學習單', 'PDF・勾選式', '/light-lens/files/透鏡第1節_學習單.pdf', [['網頁版', '/light-lens/worksheet.html']]);
  add('light', G, 'lens-plan', 'teacher', '透鏡第 1 節教案台詞', 'PDF・逐頁台詞', '/light-lens/files/01_透鏡_第1節教案台詞.pdf');
  add('light', G, 'lens-cheat', 'teacher', '透鏡原理老師小抄', '一頁看懂', '/light-lens/files/lens-cheatsheet.html', [['PDF', '/light-lens/files/透鏡原理_老師小抄.pdf']]);

  G = '中秋特別任務';
  add('light', G, 'moon-home', 'home', '中秋月光之謎', '月亮自己會發光嗎？', '/moon/');
  add('light', G, 'moon-quiz', 'game', '中秋月光大搶答', '分隊搶答', '/moon/quiz.html');
  add('light', G, 'moon-sheet', 'print', '中秋學習單', '網頁版・可列印', '/moon/sheet.html');
  add('light', G, 'moon-script', 'teacher', '中秋逐格教案台詞', '老師用', '/moon/script.html');

  /* ===== MV ===== */
  add('mv', 'MV', 'mv-snap', 'mv', '折一下 Snap!', '光的折射・逐字歌詞', '/light-refract/mv.html');
  add('mv', 'MV', 'mv-teen', 'mv', '光光在哪裡', '光單元主題曲', '/light-mv-teen.html');

  /* ===== 開場與收心 ===== */
  add('class', '開場與收心', 'checkin', 'tool', '心情打卡・光之泡泡', '上課開場儀式', '/games/checkin.html', [['謝幕', '/games/checkin.html#end']]);
  add('class', '開場與收心', 'breathe', 'tool', '光之呼吸站', '海浪聲・跟著呼吸', '/games/breathe.html');

  /* ===== 舊教材 ===== */
  G = '芎林國中時期';
  add('archive', G, 'old-career', 'tool', '15 群科探索護照', '暑假生涯探索任務', '/career-passport.html');
  add('archive', G, 'old-mosaic', 'game', '馬賽克猜猜樂', '原住民飲食文化', '/games/mosaic-quiz.html');
  add('archive', G, 'old-triangle', 'game', '三角形闖關', '數學個別練習', '/haijun-triangle_2.html');
  add('archive', G, 'old-hub', 'home', '數學・英文教材總覽', '幾何特訓、英文聽力等', '/classtools1020/hub.html');
  G = '自然課早期版本';
  add('archive', G, 'old-eyes', 'home', '眼睛被騙了', '光單元最早的入口頁', '/eyes/');
  add('archive', G, 'old-ship', 'game', '光之號大冒險', '光線特勤隊早期遊戲', '/games/eyes-tricked.html');

  window.CATALOG = T;

  /* 左邊選單的「外部」入口 */
  window.LINKS = {
    today: { name: '今天上課', icon: '📅', u: '/light/', note: '主選單：點日期→每一步' },
    sports: { name: '適應體育競賽', icon: '🏅', u: 'https://hccadaptive.com/', note: '新竹縣適應體育成績公告' }
  };
})();
