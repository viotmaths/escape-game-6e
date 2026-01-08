import os
import base64
import re
import glob

def embed_ggb(html_file):
    print(f"Checking {html_file}...")
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find filename reference
    # "filename": "niveau1.ggb",
    match = re.search(r'"filename":\s*"([^"]+\.ggb)"', content)
    
    if match:
        ggb_filename = match.group(1)
        if os.path.exists(ggb_filename):
            print(f"  Found reference to {ggb_filename}. Embedding...")
            with open(ggb_filename, 'rb') as ggb:
                encoded_string = base64.b64encode(ggb.read()).decode('utf-8')
            
            # Replace lines
            # "filename": "niveau1.ggb" -> "ggbBase64": "..."
            new_param = f'"ggbBase64": "{encoded_string}"'
            
            new_content = content.replace(match.group(0), new_param)
            
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"  Successfully updated {html_file}")
        else:
            print(f"  Warning: Referenced file {ggb_filename} not found!")
    else:
        print(f"  No .ggb filename reference found.")

print("Starting embedding process...")
files = glob.glob('defi*.html')
for html_file in files:
    embed_ggb(html_file)
print("Done.")
