import fontforge
import os


#* Font preferences + character widths
unit_mult = 10
font_prefs = [
	{
		"name": "TallFat",
		"spacing": 1,
		"glyph_height": 57.5,
		"glyph_widths": {
			"0": 12,
			"1": 5.5,
			"2": 12,
			"3": 12,
			"4": 12,
			"5": 12,
			"6": 12,
			"7": 12,
			"8": 12,
			"9": 12,

			"A": 12,
			"M": 18.5,
			"N": 18.5,
			"O": 12,
			"P": 12,
			"W": 18.5,

			":": 5.5,
			"!": 5.5
		}
	},
	{
		"name": "ShortFat",
		"spacing": 1,
		"glyph_height": 44.5,
		"glyph_widths": {
			"0": 12,
			"1": 5.5,
			"2": 12,
			"3": 12,
			"4": 12,
			"5": 12,
			"6": 12,
			"7": 12,
			"8": 12,
			"9": 12,

			"A": 12,
			"M": 18.5,
			"N": 18.5,
			"O": 12,
			"P": 12,
			"W": 18.5,

			":": 5.5,
			"!": 5.5
		}
	},
	{
		"name": "ShortSkinny",
		"spacing": 1.5,
		"glyph_height": 51.5,
		"glyph_widths": {
			"0": 12.5,
			"1": 5.5,
			"2": 12.5,
			"3": 12.5,
			"4": 12.5,
			"5": 12.5,
			"6": 12.5,
			"7": 12.5,
			"8": 12.5,
			"9": 12.5,

			"A": 12.5,
			"M": 19.5,
			"N": 19.5,
			"O": 12.5,
			"P": 12.5,
			"W": 19.5,

			":": 5.5,
			"!": 5.5
		}
	}
]


def generate_font(index):
	font_pref = font_prefs[index]

	# Create a new font
	font = fontforge.font()
	font.encoding = "UnicodeFull"
	font.ascent = int(font_pref["glyph_height"] * unit_mult)
	font.descent = 0

	# Add glyphs to the font
	for char, width in font_pref["glyph_widths"].items():
		codepoint = ord(char)
		glyph = font.createChar(codepoint, char)

		filename = char
		if char == ":": filename = "Colon"
		if char == "!": filename = "Exclamation Point"
		
		glyph.importOutlines(font_pref["name"] + "/glyphs/" + filename + ".svg")
		glyph.width = int(width * unit_mult)
		glyph.left_side_bearing = 0
		glyph.right_side_bearing = 0

		print(f'{char} - {glyph.boundingBox()}')

	# Kerning setup using GPOS
	font.addLookup("KernLookup", "gpos_pair", None, (("kern", (("latn", ("dflt",)),)),))
	font.addLookupSubtable("KernLookup", "KernSubtable")

	# Add kerning for every pair
	for left in font_pref["glyph_widths"]:
		for right in font_pref["glyph_widths"]:
			font[left].addPosSub("KernSubtable", right, int(font_pref["spacing"] * unit_mult))

	# Set font metadata
	font.fontname = "Hades-" + font_pref["name"]
	font.fullname = "Hades " + font_pref["name"]
	font.familyname = "Hades"

	# Generate font
	font.generate(font.fontname + ".ttf")
	print("✅ TTF font generated: " + font.fontname + ".ttf")


#* Generate time!
for f in range(len(font_prefs)):
	generate_font(f)
