# backend/pdf_service.py
# ✅ Fixed variable name typo

from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Preformatted
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
import re
import html

styles = getSampleStyleSheet()

if "Code" not in styles:
    styles.add(
        ParagraphStyle(
            name="Code",
            fontName="Courier",
            fontSize=10,
            leading=12,
            textColor=colors.black,
            backColor=colors.whitesmoke,
            leftIndent=10,
            rightIndent=10,
            spaceBefore=10,
            spaceAfter=10,
        )
    )

def safe_filename(text: str) -> str:
    text = re.sub(r'[^a-zA-Z0-9_\w\s-]', ' ', text)
    text = text.strip().replace(" ", "_")
    return text[:50]

def clean_text_for_pdf(text: str) -> str:
    text = html.escape(text)
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
    text = text.replace("* ", "• ")
    text = text.replace("\n", "<br/>")
    return text

def split_code_and_text(answer: str):
    explanation = answer.split("`")[0].strip()
    code_blocks = re.findall(r"`(.*?)`", answer, re.S)
    
    cleaned_blocks = []
    for block in code_blocks:
        lines = block.strip().splitlines()
        if lines and lines[0].isalpha():
            lines = lines[1:]
        cleaned_blocks.append("\n".join(lines))
    
    return explanation, cleaned_blocks

def generate_pdf(question: str, answer: str, marks: int):
    file_name = f"{safe_filename(question)}.pdf"
    doc = SimpleDocTemplate(file_name, pagesize=A4)
    content = []
    
    content.append(Paragraph("AI Academic Answer Sheet", styles["Title"]))
    content.append(Spacer(1, 10))
    
    content.append(Paragraph(f"<b>Question ({marks} marks):</b>", styles["Normal"]))
    content.append(Paragraph(question, styles["Normal"]))
    content.append(Spacer(1, 10))
    
    explanation, code_blocks = split_code_and_text(answer)
    safe_explanation = clean_text_for_pdf(explanation)
    
    # ✅ FIXED: safe_explanation (was safe_explana tion)
    content.append(Paragraph(safe_explanation, styles["Normal"]))
    
    for block in code_blocks:
        content.append(Spacer(1, 8))
        content.append(Preformatted(block, styles["Code"]))
    
    doc.build(content)
    return file_name