import bz2
import xml.etree.ElementTree as ET
import re

filename = "input/enwiktionary-latest-pages-articles.xml.bz2"
savefile = "output/wiktionary-yhdyssanat"
finnish_compound = r"compound\|fi"
grep_comp = r"\{\{compound\|fi[^\}]*\|([^=\}]*)\|[^\}]*(?<=\|)([^=\}]*)(?:\|[^\}]*)?\}\}"
# teststring = "{{compound|fi|ammatti|kieli|t1=profession|t2=language}}"

def get_child(elem, name):
    for child in elem:
        if child.tag.split("}")[-1] == name:
            return child
    return None
i = 0
resume_after_title = "joukkuetoveri"
resumed = False


with open(savefile, "a") as save:
    with bz2.open(filename, "rb") as f:
        context = ET.iterparse(f, events=("start", "end"))
        _, root = next(context)
        for event, elem in context:
            #     break
            if event == "end" and elem.tag.endswith("page"):
                try:
                    title = get_child(elem, "title")
                    revision = get_child(elem, "revision")
                    if title == None or revision == None:
                        continue
                    if not resumed:
                        if title.text == resume_after_title:
                            resumed = True
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
                    if i%500 == 0:
                        print(i)
                    # print(title.text)
                    parts = re.findall(grep_comp, text.text, re.M +re.U)[0]
                    part1 = parts[0]
                    part2 = parts[1]
                    part1 = part1.lower().replace('-','')
                    part2 = part2.lower().replace('-','')
                    if not part1.isalpha() or not part2.isalpha():
                        continue
                    if part1 == "" or part2 == "":
                        continue

                    # print(part1,part2)
                    toadd = f"{part1},{part2},{title.text}\n"
                    save.write(toadd)
                finally:
                    root.clear()
