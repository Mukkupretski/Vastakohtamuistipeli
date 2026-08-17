import bz2
import xml.etree.ElementTree as ET

filename = "input/enwiktionary-latest-pages-articles.xml.bz2"

i = 0
with bz2.open(filename, "rb") as f:
    for event, elem in ET.iterparse(f, events=("end",)):
        if i > 50:
            break
        if elem.tag.endswith("page"):
            i += 1
            print(elem.text)
            # You now have one complete Wiktionary page.
            # Find its <title>, <text>, etc. yourself here.

            elem.clear()

