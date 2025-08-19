from PIL import Image
import math

width, height = 1000, 300
img = Image.new("RGBA", (width, height))

for y in range(height):
	t = y / (height - 1)
	ny = t ** (0.5)
	alpha = int(255 * (1 - ny))
	color = (0, 0, 0, alpha)
	for x in range(width):
		img.putpixel((x, y), color)

img.save("shadow.png")
print("Saved shadow.png")
