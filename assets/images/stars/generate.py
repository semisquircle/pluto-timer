from PIL import Image, ImageDraw
import random
import math

def star_points(x, y, outer_r, inner_r, num_points=4, rotation_deg=-10):
	points = []
	angle_between = math.pi / num_points
	rotation_rad = math.radians(rotation_deg)

	for i in range(num_points * 2):
		angle = i * angle_between + rotation_rad
		r = outer_r if i % 2 == 0 else inner_r
		px = x + r * math.cos(angle)
		py = y + r * math.sin(angle)
		points.append((px, py))

	return points

def generate_non_overlapping_positions(width, height, num_points, min_dist, max_attempts=5000):
	"""Generate up to num_points positions such that all are at least min_dist apart."""
	points = []
	attempts = 0
	while len(points) < num_points and attempts < max_attempts:
		x = random.randint(min_dist, width - min_dist)
		y = random.randint(min_dist, height - min_dist)
		if all((x - px) ** 2 + (y - py) ** 2 >= min_dist ** 2 for px, py in points):
			points.append((x, y))
		attempts += 1
	return points

def generate_stars(star_radii, height=1000, num_circles=100):
	bg_color = (0, 0, 0, 0)
	# bg_color = "black"
	star_color = "white"

	scale = 4
	big_width = height * scale
	big_height = height * scale

	for i, r in enumerate(star_radii):
		outer_r = r * scale
		inner_r = outer_r * 0.3
		min_dist = outer_r * 2  # ensures no overlap

		img = Image.new("RGBA", (big_width, big_height), bg_color)
		draw = ImageDraw.Draw(img)

		stars_per_img = math.floor(num_circles / len(star_radii))

		positions = generate_non_overlapping_positions(
			big_width, big_height, stars_per_img, min_dist
		)

		for (x, y) in positions:
			points = star_points(x, y, outer_r, inner_r, num_points=4, rotation_deg=-10)
			draw.polygon(points, star_color)

		img = img.resize((height, height), Image.LANCZOS)
		doubled = Image.new("RGBA", (height * 2, height), bg_color)
		doubled.paste(img, (0, 0))
		doubled.paste(img, (height, 0))

		doubled.save(f"stars{i + 1}.png", "PNG", optimize=True)
		print(f"Image saved as stars{i + 1}.png")

generate_stars(star_radii=[4, 7, 10], height=1200, num_circles=102)
