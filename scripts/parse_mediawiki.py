import bz2
import xml.etree.ElementTree as ET
import re

filename = "input/enwiktionary-latest-pages-articles.xml.bz2"
finnish_compound = r"compound\|fi"
grep_comp = r"\{\{compound\|fi[^\}]*\|([^=\}]*)\|[^\}]*(?<=\|)([^=\}]*)(?:\|[^\}]*)?\}\}"
# teststring = "{{compound|fi|ammatti|kieli|t1=profession|t2=language}}"

def get_child(elem, name):
    for child in elem:
        if child.tag.split("}")[-1] == name:
            return child
    return None
i = 0

with bz2.open(filename, "rb") as f:
    for event, elem in ET.iterparse(f, events=("end",)):
        if i > 500:
            break
        if elem.tag.endswith("page"):
            title = get_child(elem, "title")
            revision = get_child(elem, "revision")
            if title == None or revision == None:
                continue
            text = get_child(revision, "text")
            if text == None:
                continue
            if text.text == None:
                continue
            is_compound = re.search(finnish_compound, text.text)
            if not is_compound:
                continue
            i += 1
            print(title.text)
            parts = re.findall(grep_comp, text.text, re.M +re.U)[0]
            part1 = parts[0]
            part2 = parts[1]
            part1 = part1.lower().replace('-','')
            part2 = part2.lower().replace('-','')
            print(part1,part2)


