from PIL import Image
import math

size = 500
img = Image.new("RGBA", (size, size))

for y in range(size):
	y_n = y / (size - 1)
	t = y_n**0.5
	alpha = int(255 * (1 - t))
	color = (0, 0, 0, alpha)
	for x in range(size):
		img.putpixel((x, y), color)

img.save("shadow-flat.png")
print("Saved shadow-flat.png")
