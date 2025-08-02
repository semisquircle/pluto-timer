import fontforge
import os

# Define glyph data
glyph_height = 575
spacing = 10

# Width map for specific characters
char_widths = {
	"A": 12,
	"M": 18.5,
	"N": 18.5,
	"O": 12,
	"P": 12,
	"W": 18.5,

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

	":": 5.5,
	"!": 5.5,
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
	if char == "!": filename = "Exclamation Point"
	
	svg_path = os.path.join("glyphs", filename + ".svg")
	glyph.importOutlines(svg_path)
	glyph.width = int(width * 10)
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
font.generate("../" + font.fontname + ".ttf")
print("✅ TTF font generated: " + font.fontname + ".ttf")
