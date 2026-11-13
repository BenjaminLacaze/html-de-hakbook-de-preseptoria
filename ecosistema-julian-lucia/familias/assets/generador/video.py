"""Video de presentación del módulo Familias, igual a los loops de los otros paneles:
logo marca sobre blanco -> un panel navy barre de izquierda a derecha con una línea arena
en el borde -> logo negativo sobre navy -> el blanco vuelve a barrer -> queda en bucle.
1920x1080 a 60 fps, H.264. Uso: video.py <carpeta con los PNG> <ffmpeg> <salida.mp4>"""
import subprocess
import sys
from PIL import Image

SRC, FFMPEG, OUT = sys.argv[1:4]
W, H, FPS, SECONDS = 1920, 1080, 60, 7.0
NAVY, WHITE, SAND = (20, 33, 79), (255, 255, 255), (175, 155, 99)
LINE = 4  # ancho de la línea arena del borde

# Tiempos (s): claro, barrido a navy, navy, barrido a claro, claro
T_IN, T_NAVY, T_OUT, T_LIGHT = 1.5, 2.5, 5.0, 6.0


def ease(t):
    t = max(0.0, min(1.0, t))
    return 4 * t * t * t if t < 0.5 else 1 - (-2 * t + 2) ** 3 / 2


def scene(bg, logo_file):
    logo = Image.open(f"{SRC}/{logo_file}")
    h = int(H * 0.49)
    logo = logo.resize((round(logo.width * h / logo.height), h), Image.LANCZOS)
    im = Image.new("RGB", (W, H), bg)
    im.paste(logo, ((W - logo.width) // 2, (H - logo.height) // 2), logo)
    return im


light, dark = scene(WHITE, "familias-logo-marca.png"), scene(NAVY, "familias-logo-negativo.png")
line = Image.new("RGB", (LINE, H), SAND)

ff = subprocess.Popen(
    [FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
     "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p",
     "-movflags", "+faststart", OUT],
    stdin=subprocess.PIPE,
)
for i in range(int(SECONDS * FPS)):
    t = i / FPS
    if t < T_NAVY:  # el navy entra desde la izquierda
        edge = round(W * ease((t - T_IN) / (T_NAVY - T_IN)))
        left, right = dark, light
    else:  # el blanco vuelve desde la izquierda
        edge = round(W * ease((t - T_OUT) / (T_LIGHT - T_OUT)))
        left, right = light, dark
    frame = right.copy()
    if edge > 0:
        frame.paste(left.crop((0, 0, edge, H)), (0, 0))
        if edge < W:
            frame.paste(line, (edge, 0))
    ff.stdin.write(frame.tobytes())
ff.stdin.close()
sys.exit(ff.wait())
