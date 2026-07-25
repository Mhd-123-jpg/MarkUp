import os
import json
from gemini_extractor import extract_booklet_data

def test_all_samples():
    sample_dir = os.path.join(os.path.dirname(__file__), "samples")
    sample_files = ["sample1.jpg", "sample2.jpg", "sample3.jpg"]

    for filename in sample_files:
        filepath = os.path.join(sample_dir, filename)
        if not os.path.exists(filepath):
            print(f"File {filepath} not found.")
            continue

        print(f"\n==========================================")
        print(f" TESTING: {filename}")
        print(f"==========================================")
        with open(filepath, "rb") as f:
            image_bytes = f.read()

        try:
            result = extract_booklet_data(image_bytes, mime_type="image/jpeg")
            print(json.dumps(result.model_dump(), indent=2))
        except Exception as e:
            print(f"Error extracting {filename}: {e}")

if __name__ == "__main__":
    test_all_samples()
