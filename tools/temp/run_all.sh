#!/bin/bash
# 全部重做：網頁簡報 → 截圖 → PPT → 講義＋學習單。需要先在 repo 根目錄開：python3 -m http.server 8765
set -e
cd "$(dirname "$0")/../.."
CAP=${CAP:-/tmp/temp-cap}
python3 tools/temp/build.py web
for T in T1 T2 T3 T4 T5 T6; do
  python3 tools/temp/cap.py http://localhost:8765/temp/${T,,}.html $CAP/$T
  python3 tools/temp/ppt.py $CAP/$T temp/files/$T-temp.pptx https://classtools1020.github.io/temp/
done
for T in T1 T2 T3 T4 T5; do python3 tools/temp/printout.py $T $CAP/$T temp/files/$T-print.pdf; done
python3 tools/temp/printout.py T6 $CAP/T6 temp/files/T6-check.pdf
