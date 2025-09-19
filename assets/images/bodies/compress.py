from PIL import Image
from termcolor import colored

def compress_png(body_name):
	Image.MAX_IMAGE_PIXELS = None
	img = Image.open("sprite-sheets/uncompressed/" + body_name + ".png")
	
	colors = img.getcolors(maxcolors=100)
	num_colors = len(colors)

	img = img.convert("P", palette=Image.ADAPTIVE, colors=num_colors)
	img.save("sprite-sheets/" + body_name + ".png", optimize=True)

	print()
	print(colored(f'Number of unique colors: {num_colors}', "light_cyan"))
	print(colored(f'Compressed {body_name}.png', "light_cyan"))
	print()

compress_png("Mercury")
