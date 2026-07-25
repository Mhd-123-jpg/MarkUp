from PIL import Image, ImageDraw, ImageFont
import os

def create_sample_booklet(output_path="test_booklet.jpg"):
    # Create white canvas
    img = Image.new('RGB', (800, 1100), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Fonts
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
        header_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 16)
        text_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 14)
        handwriting_blue = ImageFont.truetype("/System/Library/Fonts/Supplemental/Bradley Hand Bold.ttf", 20)
        handwriting_red = ImageFont.truetype("/System/Library/Fonts/Supplemental/Bradley Hand Bold.ttf", 22)
    except Exception:
        title_font = ImageFont.load_default()
        header_font = ImageFont.load_default()
        text_font = ImageFont.load_default()
        handwriting_blue = ImageFont.load_default()
        handwriting_red = ImageFont.load_default()

    # Border
    draw.rectangle([20, 20, 780, 1080], outline=(0, 0, 0), width=2)

    # Header Title
    draw.text((250, 40), "MUTHOOT INSTITUTE OF TECHNOLOGY & SCIENCE", fill=(0, 0, 0), font=header_font)
    draw.text((320, 70), "INTERNAL EXAMINATION", fill=(200, 16, 46), font=title_font)
    draw.line([40, 110, 760, 110], fill=(0, 0, 0), width=2)

    # Fields (Pre-printed labels + handwritten blue entries)
    fields = [
        ("Name of Student:", "Mathew K Joseph", 130),
        ("Roll No:", "21CS088", 170),
        ("Semester:", "S4", 210),
        ("Branch:", "Computer Science & Engg", 250),
        ("Name of Examination:", "I.E.", 290),
        ("Course Code:", "CST201", 330),
        ("Course Name:", "Data Structures", 370),
        ("Date:", "24/07/26", 410)
    ]

    for label, val, y in fields:
        draw.text((60, y), label, fill=(0, 0, 0), font=header_font)
        draw.line([240, y + 22, 740, y + 22], fill=(180, 180, 180), width=1)
        draw.text((250, y - 2), val, fill=(10, 30, 140), font=handwriting_blue)  # Blue ink

    # Marks Grid Title
    draw.text((200, 470), "MARKS TO BE FILLED BY THE EXAMINER", fill=(0, 0, 0), font=header_font)
    
    # Table Grid
    grid_left = 60
    grid_top = 500
    cell_w = 68
    cell_h = 40

    # Column Headers: Q1 to Q10
    draw.rectangle([grid_left, grid_top, grid_left + 680, grid_top + 30], outline=(0, 0, 0), width=1)
    draw.text((grid_left + 10, grid_top + 5), "Qnos", fill=(0, 0, 0), font=text_font)
    
    for i in range(1, 11):
        x = grid_left + (i * cell_w)
        draw.line([x, grid_top, x, grid_top + 190], fill=(0, 0, 0), width=1)
        draw.text((x + 20, grid_top + 5), f"{i}", fill=(0, 0, 0), font=text_font)

    # Sub Qns rows: a, b, c
    rows = ['a', 'b', 'c', 'Sub total']
    for r_idx, r_name in enumerate(rows):
        y = grid_top + 30 + (r_idx * cell_h)
        draw.line([grid_left, y, grid_left + 680, y], fill=(0, 0, 0), width=1)
        draw.text((grid_left + 10, y + 10), r_name, fill=(0, 0, 0), font=text_font)

    draw.line([grid_left, grid_top + 190, grid_left + 680, grid_top + 190], fill=(0, 0, 0), width=1)

    # Sample Red Ink Marks
    sample_marks = {
        (1, 'a'): "4", (1, 'b'): "3",
        (2, 'a'): "5", (2, 'b'): "4",
        (3, 'a'): "3", (3, 'b'): "2",
        (4, 'a'): "5",
        (5, 'a'): "4", (5, 'b'): "3",
        (6, 'a'): "4"
    }

    sub_keys = ['a', 'b', 'c']
    for (q_num, sub_key), mark_val in sample_marks.items():
        r_idx = sub_keys.index(sub_key)
        x = grid_left + (q_num * cell_w) + 22
        y = grid_top + 30 + (r_idx * cell_h) + 5
        draw.text((x, y), mark_val, fill=(200, 16, 46), font=handwriting_red)  # Red ink

    # Boxed Fields at Bottom Right: Marks Secured & Maximum Marks
    draw.rectangle([450, 720, 740, 800], outline=(200, 16, 46), width=3)
    draw.text((460, 730), "Marks Secured:", fill=(0, 0, 0), font=header_font)
    draw.text((640, 725), "37", fill=(200, 16, 46), font=handwriting_red)

    draw.rectangle([450, 820, 740, 900], outline=(0, 0, 0), width=2)
    draw.text((460, 830), "Maximum Marks:", fill=(0, 0, 0), font=header_font)
    draw.text((640, 825), "50", fill=(200, 16, 46), font=handwriting_red)

    img.save(output_path)
    print(f"Sample Muthoot booklet image saved to {output_path}")

if __name__ == "__main__":
    create_sample_booklet()
