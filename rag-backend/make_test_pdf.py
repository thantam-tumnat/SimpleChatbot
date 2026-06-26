import fitz

doc = fitz.open()
page = doc.new_page()
text = """Company Handbook - Zorblax Corp

Zorblax Corp was founded in the year 2087 by Dr. Mimi Quark.
The headquarters is located on Mars, in the Olympus-7 district.

Vacation policy: every employee gets 42 vacation days per year.
The secret office access code is PURPLE-BANANA-9000.

The main product is a dream-to-coffee converter, model DreamBrew X.
Its retail price is 13,500 galaxy credits.
"""
page.insert_text((50, 80), text, fontsize=11, fontname="helv")
doc.save("data/test.pdf")
doc.close()
print("test.pdf created OK")
