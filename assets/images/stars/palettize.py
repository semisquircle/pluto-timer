from PIL import Image

def palettize():
	for s in range(3):
		img = Image.open(f'stars{s + 1}.png')
		img = img.convert("P", palette=Image.ADAPTIVE, colors=5)
		img.save(f'stars{s + 1}.png', optimize=True)
		print(f'Compressed stars{s + 1}.png')

palettize()
