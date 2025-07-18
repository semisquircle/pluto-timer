import fontforge
import os

# Define glyph data
glyph_height = 575
spacing = 10

# Width map for specific characters
char_widths = {
	"A": 120,
	"P": 120,
	"M": 185,
	"0": 120,
	"1": 55,
	"2": 120,
	"3": 120,
	"4": 120,
	"5": 120,
	"6": 120,
	"7": 120,
	"8": 120,
	"9": 120,
	":": 55,
}

# Create a new font
font = fontforge.font()
font.encoding = "UnicodeFull"
font.ascent = glyph_height
font.descent = 0

# Add glyphs to the font
for char, width in char_widths.items():
	codepoint = ord(char)
	glyph = font.createChar(codepoint, char)

	filename = char
	if char == ":": filename = "Colon"
	
	svg_path = os.path.join("glyphs", filename + ".svg")
	glyph.importOutlines(svg_path)
	glyph.width = width
	glyph.left_side_bearing = 0
	glyph.right_side_bearing = 0

	print(f'{char} - {glyph.boundingBox()}')

# --- Kerning setup using GPOS ---
font.addLookup("KernLookup", "gpos_pair", None, (("kern", (("latn", ("dflt",)),)),))
font.addLookupSubtable("KernLookup", "KernSubtable")

# Add kerning for every pair
for left in char_widths:
	for right in char_widths:
		font[left].addPosSub("KernSubtable", right, spacing)

# --- Set font metadata ---
font.fontname = "outward-semi"
font.fullname = "Outward Semi"
font.familyname = "Outward"

# --- Generate font ---
font.generate("../Outward/" + font.fontname + ".ttf")
print("✅ TTF font generated: " + font.fontname + ".ttf")
