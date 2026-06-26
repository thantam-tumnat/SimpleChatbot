import fitz

doc = fitz.open()
page = doc.new_page()
text = """Nimbus Airlines - Internal Memo

Nimbus Airlines operates flights between floating sky-cities.
The CEO is Captain Aria Stratos.

Baggage policy: each passenger may bring 3 cloud-crates for free.
The VIP lounge password is SILVER-COMET-2200.

The flagship aircraft is the SkyWhale 900, cruising at altitude 40,000 ft.
"""
page.insert_text((50, 80), text, fontsize=11, fontname="helv")
doc.save("data/nimbus.pdf")
doc.close()
print("nimbus.pdf created OK")
