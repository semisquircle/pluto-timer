from PIL import Image

def compress_png(input_path):
	for i in range(4):
		img = Image.open(f"{input_path}/uncompressed/{i + 1}.png")
		img.save(f"{input_path}/{i + 1}.png", optimize=True)
		print(f"Compressed {input_path}/{i + 1}.png")

compress_png("unpressed")
compress_png("pressed")
