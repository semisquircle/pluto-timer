import json
import requests

API_BASE_URL = "https://api.le-systeme-solaire.net/rest/bodies/"

def update_planet_data(filename):
	# Load existing data
	try:
		with open(filename, 'r', encoding='utf-8') as file:
			bodies = json.load(file)
	except FileNotFoundError:
		print(f"Error: File '{filename}' not found.")
		return
	except json.JSONDecodeError:
		print("Error: JSON file is malformed.")
		return

	# Update each planet's data
	for body in bodies:
		name = body.get("name", "").lower()
		if not name:
			continue  # skip invalid entries

		try:
			response = requests.get(API_BASE_URL + name)
			response.raise_for_status()
			data = response.json()
		except requests.RequestException as e:
			print(f"Failed to retrieve data for {name}: {e}")
			continue

		# Update fields if they exist in the API response
		if "axialTilt" in data:
			body["axialTilt"] = data["axialTilt"]
		if "eccentricity" in data:
			body["ecc"] = data["eccentricity"]

		print(f"Updated {name}: axialTilt={body['axialTilt']}, ecc={body['ecc']}")

	# Save updated data
	with open(filename, 'w', encoding='utf-8') as file:
		json.dump(bodies, file, indent=2, ensure_ascii=False)
	print(f"\nUpdated data saved to '{filename}'.")

# Run the update
if __name__ == "__main__":
	update_planet_data("bodies.json")
