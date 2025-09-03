from PIL import Image

def compress_png(body_name, numColors):
	Image.MAX_IMAGE_PIXELS = None
	img = Image.open("sprite-sheets/uncompressed/" + body_name + ".png")
	img = img.convert("P", palette=Image.ADAPTIVE, colors=numColors)
	img.save("sprite-sheets/" + body_name + ".png", optimize=True)
	print("Compressed " + body_name + ".png")

compress_png("Terra", 11)
