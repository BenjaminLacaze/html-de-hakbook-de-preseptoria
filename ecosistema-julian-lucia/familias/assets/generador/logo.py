"""Logo del módulo Familias: "F" serif bajo un techo, con dos puntos arena (adulto y niño).
Sigue la familia de logos del sistema (Alumnos: A + libro; Centro: C + globo y puntos).
Genera marca (fondos claros) y negativo (fondos navy), PNG con transparencia."""
import sys
from PIL import Image, ImageDraw, ImageFont

OUT = sys.argv[1]
W, H, SS = 1400, 1447, 3  # tamaño final y supermuestreo
NAVY, SAND, WHITE = (20, 33, 79, 255), (175, 155, 99, 255), (255, 255, 255, 255)
SERIF_BOLD = r"C:\Windows\Fonts\georgiab.ttf"


def s(v):
    return int(round(v * SS))


def draw_logo(ink):
    im = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)

    # Letra F
    f_font = ImageFont.truetype(SERIF_BOLD, s(860))
    l, t, r, b = d.textbbox((0, 0), "F", font=f_font)
    f_top, f_left = s(440), s(345)
    d.text((f_left - l, f_top - t), "F", font=f_font, fill=ink)
    f_bottom = f_top + (b - t)

    # Techo: chevrón sobre la letra (el hogar)
    apex, half, rise, thick = (s(700), s(75)), s(480), s(235), s(74)
    left = (apex[0] - half, apex[1] + rise)
    right = (apex[0] + half, apex[1] + rise)
    d.polygon([apex, right, (right[0], right[1] + thick), (apex[0], apex[1] + thick), (left[0], left[1] + thick), left], fill=ink)

    # Dos puntos arena: adulto y niño, apoyados en la misma línea
    base = f_bottom
    for cx, rad in ((s(832), s(88)), (s(1002), s(56))):
        d.ellipse([cx - rad, base - 2 * rad, cx + rad, base], fill=SAND)

    # Nombre del módulo
    t_font = ImageFont.truetype(SERIF_BOLD, s(176))
    text, track = "FAMILIAS", s(22)
    widths = [d.textlength(ch, font=t_font) for ch in text]
    total = sum(widths) + track * (len(text) - 1)
    x = (W * SS - total) / 2
    for ch, w in zip(text, widths):
        d.text((x, s(1232)), ch, font=t_font, fill=ink)
        x += w + track
    return im.resize((W, H), Image.LANCZOS)


marca, negativo = draw_logo(NAVY), draw_logo(WHITE)
marca.save(f"{OUT}/familias-logo-marca.png")
negativo.save(f"{OUT}/familias-logo-negativo.png")

# Vista previa lado a lado para revisar
prev = Image.new("RGB", (W * 2, H), (255, 255, 255))
prev.paste(Image.new("RGB", (W, H), NAVY[:3]), (W, 0))
prev.paste(marca, (0, 0), marca)
prev.paste(negativo, (W, 0), negativo)
prev.resize((W, H // 2)).save(f"{OUT}/preview.png")
print("ok")
