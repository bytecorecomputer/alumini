import re
import json

with open('/tmp/libre_raw.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Normalize some spacing issues and weird characters
text = text.replace('  ', ' ')

# Split into blocks by question number. 
# A question starts with number followed by dot and space at the beginning of a line.
blocks = re.split(r'\n(?=\d+\.\s)', '\n' + text)

questions = []
for block in blocks:
    block = block.strip()
    if not block:
        continue
    
    # Try to extract the answer
    ans_match = re.search(r'Ans\.\s*([a-d])', block, re.IGNORECASE)
    if not ans_match:
        continue
        
    ans_letter = ans_match.group(1).lower()
    ans_idx = ord(ans_letter) - ord('a')
    
    # Remove the Ans line from block for parsing options
    q_body = block[:ans_match.start()].strip()
    
    # Extract options: look for a), b), c), d)
    opt_a_match = re.search(r'a\)\s*(.*?)(?=b\)|c\)|d\)|$)', q_body, re.IGNORECASE | re.DOTALL)
    opt_b_match = re.search(r'b\)\s*(.*?)(?=c\)|d\)|$)', q_body, re.IGNORECASE | re.DOTALL)
    opt_c_match = re.search(r'c\)\s*(.*?)(?=d\)|$)', q_body, re.IGNORECASE | re.DOTALL)
    opt_d_match = re.search(r'd\)\s*(.*?)(?=$)', q_body, re.IGNORECASE | re.DOTALL)
    
    if not opt_a_match:
        continue
        
    q_text_match = re.match(r'\d+\.\s*(.*?)(?=\n*a\))', q_body, re.IGNORECASE | re.DOTALL)
    if not q_text_match:
        continue
        
    qtext = q_text_match.group(1).strip().replace('\n', ' ')
    opts = []
    
    for m in [opt_a_match, opt_b_match, opt_c_match, opt_d_match]:
        if m:
            opts.append(m.group(1).strip().replace('\n', ' '))
            
    # Fix correct answer if options are fewer than expected
    if ans_idx >= len(opts):
        continue
        
    # Determine category
    qtext_lower = qtext.lower()
    cat = 'libre_writer'
    if 'calc' in qtext_lower or 'spreadsheet' in qtext_lower or 'row' in qtext_lower or 'column' in qtext_lower or 'cell' in qtext_lower:
        cat = 'libre_calc'
    elif 'impress' in qtext_lower or 'slide' in qtext_lower or 'presentation' in qtext_lower:
        cat = 'libre_impress'
        
    questions.append({
        'question': qtext,
        'options': opts,
        'correctAnswer': ans_idx,
        'explanation': f"The correct answer is {chr(97 + ans_idx)}.",
        'category': cat
    })

# Group questions into modules of 15
def chunk_dict(qs, prefix):
    res = {}
    for i in range(0, len(qs), 15):
        chunk = qs[i:i+15]
        res[f"{prefix} Mock Test {i//15 + 1}"] = chunk
    return res

writer_qs = [q for q in questions if q['category'] == 'libre_writer']
calc_qs = [q for q in questions if q['category'] == 'libre_calc']
impress_qs = [q for q in questions if q['category'] == 'libre_impress']

writer_modules = chunk_dict(writer_qs, "Writer")
calc_modules = chunk_dict(calc_qs, "Calc")
impress_modules = chunk_dict(impress_qs, "Impress")

print(f"Parsed {len(questions)} total questions.")
print(f"Writer: {len(writer_qs)}, Calc: {len(calc_qs)}, Impress: {len(impress_qs)}")

# Now inject into hindiQuizData.js
js_path = 'src/data/hindiQuizData.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

def inject_modules(content, module_key, new_modules):
    # Find the modules block for this key
    pattern = r'("' + module_key + r'":\s*\{.*?"modules":\s*\{)(.*?)(\}\n\s*\})'
    
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        print(f"Could not find modules block for {module_key}")
        return content
        
    # Build JS string for new modules
    new_mods_js = ""
    for title, qs in new_modules.items():
        # Remove 'category' from json
        for q in qs:
            del q['category']
        qs_json = json.dumps(qs, ensure_ascii=False, indent=16)
        new_mods_js += f'\n            "{title}": {qs_json},'
        
    # Insert new modules
    new_content = content[:match.end(1)] + new_mods_js + match.group(2) + match.group(3) + content[match.end(3):]
    return new_content

js_content = inject_modules(js_content, 'libre_writer', writer_modules)
js_content = inject_modules(js_content, 'libre_calc', calc_modules)
js_content = inject_modules(js_content, 'libre_impress', impress_modules)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

print("Injected successfully!")
