from PIL import Image

def generate_thumbnail(body_name, frame_size=500, thumbnail_size=200):
	Image.MAX_IMAGE_PIXELS = None
	img = Image.open("sprite-sheets/" + body_name + ".png")
	thumbnail = img.crop((0, 0, frame_size, frame_size))
	thumbnail = thumbnail.resize((thumbnail_size, thumbnail_size), Image.NEAREST)
	thumbnail = thumbnail.convert("P", palette=Image.ADAPTIVE, colors=6)
	thumbnail.save(f"thumbnails/{body_name}.png", optimize=True)
	print(f"Saved thumbnail for {body_name}")

generate_thumbnail("Terra")
