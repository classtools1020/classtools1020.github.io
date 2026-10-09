"""溫度特勤隊 產生器
python3 tools/temp/build.py web          → temp/t1.html … t6.html
python3 tools/temp/build.py cap  T1      → 截每一頁每一步（給 PPT／講義用）
python3 tools/temp/build.py ppt  T1      → temp/files/T1-temp.pptx
python3 tools/temp/build.py print T1     → temp/files/T1-print.pdf（講義＋學習單）
"""
import sys, os, json
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
from lessons import LESSONS
import web

def L_of(code): return next(L for L in LESSONS if L['code'] == code)

def build_web():
    for L in LESSONS:
        open(os.path.join(ROOT, 'temp', L['code'].lower() + '.html'), 'w').write(web.page(L))
    print('web ok')

if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'web': build_web()
