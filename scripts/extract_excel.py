import zipfile
import xml.etree.ElementTree as ET
import json
import os

excel_path = r'C:\Users\bprasad\Downloads\Resouces.xlsx'
if not os.path.exists(excel_path):
    print("Excel file not found at", excel_path)
    exit(1)

z = zipfile.ZipFile(excel_path)

shared_strings = []
if 'xl/sharedStrings.xml' in z.namelist():
    tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
    ns = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
    for elem in tree.findall(f'{ns}si'):
        t = elem.find(f'{ns}t')
        if t is not None:
            shared_strings.append(t.text or '')
        else:
            r_texts = [r.find(f'{ns}t').text or '' for r in elem.findall(f'{ns}r') if r.find(f'{ns}t') is not None]
            shared_strings.append(''.join(r_texts))

print(f"Loaded {len(shared_strings)} shared strings")

tree = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
ns = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
rows = tree.findall(f'{ns}sheetData/{ns}row')

def map_category(raw_cat):
    if not raw_cat:
        return "Resources"
    c = raw_cat.upper()
    if "DESIGN" in c or "ANIMATION" in c or "CREATIVE" in c or "VIDEO" in c:
        return "Design"
    if "DEV" in c or "CODE" in c or "AI" in c or "CYBER" in c or "SECURITY" in c:
        return "Develop"
    if "TOOL" in c or "LEARN" in c or "PRODUCTIVITY" in c or "RESOURCE" in c:
        return "Resources"
    return "Resources"

items = []
current_cat = "Resources"
seen_urls = set()

for row in rows:
    cells = {}
    for c in row.findall(f'{ns}c'):
        r_ref = c.attrib.get('r', '')
        col = ''.join([ch for ch in r_ref if ch.isalpha()])
        v = c.find(f'{ns}v')
        t_attr = c.attrib.get('t')
        val = v.text if v is not None else None
        if t_attr == 's' and val is not None:
            val = shared_strings[int(val)] if int(val) < len(shared_strings) else val
        cells[col] = val
    
    if cells.get('A') and cells.get('A').strip() != 'Category':
        current_cat = cells.get('A').strip()
    
    title = cells.get('B')
    url = cells.get('C')
    if title and url and url.startswith('http'):
        clean_url = url.strip()
        if clean_url in seen_urls:
            continue
        seen_urls.add(clean_url)
        
        main_cat = map_category(current_cat)
        items.append({
            'title': title.strip(),
            'url': clean_url,
            'category': main_cat,
            'raw_category': current_cat,
            'author': 'Aditya Raj',
            'author_handle': 'rawenergon',
            'description': f'{title.strip()} - Curated by @rawenergon for the {main_cat} directory.',
            'tags': [main_cat, current_cat.title() if current_cat else 'Curated', 'Community']
        })

print(f"Extracted {len(items)} unique items")

out_path = r'C:\Users\bprasad\.gemini\antigravity\scratch\reco-labs\resources_extracted.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(items, f, indent=2)

print("Saved to", out_path)
