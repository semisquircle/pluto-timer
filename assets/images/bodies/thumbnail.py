from PIL import Image
from termcolor import colored

def generate_thumbnail(body_name, frame_size=500, thumbnail_size=200):
	Image.MAX_IMAGE_PIXELS = None

	img = Image.open("sprite-sheets/" + body_name + ".png")

	colors = img.getcolors(maxcolors=100)
	num_colors = len(colors)

	thumbnail = img.crop((0, 0, frame_size, frame_size))
	thumbnail = thumbnail.resize((thumbnail_size, thumbnail_size), Image.NEAREST)
	thumbnail = thumbnail.convert("P", palette=Image.ADAPTIVE, colors=num_colors)
	thumbnail.save(f"thumbnails/{body_name}.png", optimize=True)

	print()
	print(colored(f'Number of unique colors: {num_colors}', "light_magenta"))
	print(colored(f'Saved thumbnail for {body_name}', "light_magenta"))
	print()

generate_thumbnail("Venus")
