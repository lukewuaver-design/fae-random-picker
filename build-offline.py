#!/usr/bin/env python3
"""產生單機版：把圖片全部嵌進一個 HTML 檔，不需要網路、不需要其他檔案，直接點兩下開啟。
用法：python3 build-offline.py   →  輸出 聲音追蹤大風吹-單機版.html
"""
import base64, re, pathlib

root = pathlib.Path(__file__).parent
html = (root / 'index.html').read_text(encoding='utf-8')

def data_uri(name):
    return 'data:image/png;base64,' + base64.b64encode((root / name).read_bytes()).decode()

html, n = re.subn(r'''(src="|url\(')([\w-]+\.png)''', lambda m: m.group(1) + data_uri(m.group(2)), html)
assert n == 5, f'預期嵌入 5 張圖，實際 {n} 張'
assert not re.search(r'''(src="|url\(')(?!data:)''', html), '還有沒嵌入的外部檔案'

out = root / '聲音追蹤大風吹-單機版.html'
out.write_text(html, encoding='utf-8')
print(out.name, f'{out.stat().st_size/1e6:.1f} MB')
