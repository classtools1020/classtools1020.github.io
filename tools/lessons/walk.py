"""牽手走進沙灘的模擬：每位同學在路上速度 1、在沙裡速度 1/n；碰到邊界照 Snell 換方向。
回傳每位同學在固定時間點的位置（快照），單位：英吋（投影片座標）。"""
import math

def norm(v):
    l = math.hypot(*v); return (v[0] / l, v[1] / l)

def simulate(starts, d0, sdf, n, times, dt=.004):
    """starts: 起點；d0: 起始方向；sdf(x,y)<0 表示在沙裡；times: 要記錄的時間點。"""
    tracks = []
    for p in starts:
        x, y = p; d = norm(d0); t = 0; out = []; ti = 0
        inside = sdf(x, y) < 0
        path = [(x, y)]
        while ti < len(times):
            if t >= times[ti] - 1e-9: out.append((x, y)); ti += 1; continue
            v = 1 / n if inside else 1
            nx, ny = x + d[0] * v * dt, y + d[1] * v * dt
            now = sdf(nx, ny) < 0
            if now != inside:
                e = 1e-4; g = norm(((sdf(nx + e, ny) - sdf(nx - e, ny)), (sdf(nx, ny + e) - sdf(nx, ny - e))))
                N = (-g[0], -g[1]) if not inside else g   # 指向入射那一側
                N = N if (d[0] * N[0] + d[1] * N[1]) < 0 else (-N[0], -N[1])
                eta = (1 / n) if not inside else n        # 速度比 v2/v1 = n1/n2
                ci = -(d[0] * N[0] + d[1] * N[1]); k = 1 - eta * eta * (1 - ci * ci)
                if k >= 0:
                    d = norm((eta * d[0] + (eta * ci - math.sqrt(k)) * N[0], eta * d[1] + (eta * ci - math.sqrt(k)) * N[1]))
                    inside = now; path.append((x, y))
                else:
                    d = (d[0] + 2 * ci * N[0], d[1] + 2 * ci * N[1]); continue
            x, y = nx, ny; t += dt
        path.append((x, y))
        tracks.append((out, path))
    return tracks

def disk(cx, cy, r): return lambda x, y: math.hypot(x - cx, y - cy) - r
def convex(cx, cy, R, thick):
    # 兩個圓相交：中間厚 thick
    a = disk(cx - R + thick / 2, cy, R); b = disk(cx + R - thick / 2, cy, R)
    return lambda x, y: max(a(x, y), b(x, y))
def concave(cx, cy, R, thin, H):
    # 長方形扣掉左右兩個圓：中間薄 thin、高度 2H
    a = disk(cx - R - thin / 2, cy, R); b = disk(cx + R + thin / 2, cy, R)
    def f(x, y):
        box = max(abs(y - cy) - H, abs(x - cx) - (thin / 2 + R - math.sqrt(max(R * R - H * H, 0))) )
        return max(box, -a(x, y), -b(x, y))
    return f
def halfplane(x0): return lambda x, y: x0 - x   # x > x0 是沙
