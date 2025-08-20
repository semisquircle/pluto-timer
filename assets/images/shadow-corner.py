from PIL import Image
import math

size = 500
img = Image.new("RGBA", (size, size))

for y in range(size):
	for x in range(size):
		x_n = x / (size - 1)
		y_n = y / (size - 1)
		r = math.sqrt(x_n**2 + y_n**2)

		if r > 1:
			alpha = 0
		else:
			t = r**2
			alpha = int(255 * t)

		color = (0, 0, 0, alpha)
		img.putpixel((x, y), color)

img.save("shadow-corner.png")
print("Saved shadow-corner.png")
