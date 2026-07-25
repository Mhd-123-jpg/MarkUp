import sys
import os
import json
from gemini_extractor import extract_booklet_data

if len(sys.argv) < 2:
    print("Usage: python test_single.py <image_path>")
    sys.exit(1)

filepath = sys.argv[1]
if not os.path.exists(filepath):
    print(f"File not found: {filepath}")
    sys.exit(1)

with open(filepath, "rb") as f:
    image_bytes = f.read()

result = extract_booklet_data(image_bytes, mime_type="image/jpeg")
print(json.dumps(result.model_dump(), indent=2))
