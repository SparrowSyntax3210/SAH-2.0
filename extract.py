import sys
from PyPDF2 import PdfReader

file_path = sys.argv[1]

reader = PdfReader(file_path)
text = ""

for page in reader.pages:
    content = page.extract_text()
    if content:
        text += content + "\n"

print(text)