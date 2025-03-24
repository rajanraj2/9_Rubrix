import os
import ffmpeg
import pytesseract
import docx
import requests
from PyPDF2 import PdfReader
from PIL import Image
from bs4 import BeautifulSoup
from models.whisper_model import get_whisper_model

whisper_model = get_whisper_model()

# ---------------------- TEXT EXTRACTION FUNCTIONS ----------------------

def extract_text_from_txt(file_path):
    """Extract text from .txt files."""
    try:
        with open(file_path, 'r', encoding='utf-8', errors="ignore") as file:
            return file.read().strip()
    except Exception as e:
        return f"Error extracting text from TXT: {str(e)}"

def extract_text_from_pdf(file_path):
    """Extract text from .pdf files. Uses OCR if no text is found."""
    text = ""
    try:
        reader = PdfReader(file_path)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

        # If no text found, use OCR as fallback
        if not text.strip():
            text = extract_text_from_image(file_path)

    except Exception as e:
        return f"Error extracting text from PDF: {str(e)}"
    
    return text.strip()

def extract_text_from_docx(file_path):
    """Extract text from .docx files."""
    try:
        doc = docx.Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs]).strip()
    except Exception as e:
        return f"Error extracting text from DOCX: {str(e)}"

def extract_text_from_image(image_path):
    """Extract text from image files using OCR (Tesseract)."""
    try:
        image = Image.open(image_path)
        return pytesseract.image_to_string(image).strip()
    except Exception as e:
        return f"Error extracting text from Image: {str(e)}"

def extract_text_from_audio(audio_path):
    """Extract text from audio files using Whisper AI."""
    try:
        result = whisper_model.transcribe(audio_path)
        return result["text"].strip()
    except Exception as e:
        return f"Error transcribing Audio: {str(e)}"

def extract_text_from_video(video_path):
    """Extract text from video files by converting to audio first using ffmpeg-python."""
    try:
        audio_path = video_path.rsplit('.', 1)[0] + ".wav"  # Convert video filename to WAV
        ffmpeg.input(video_path).output(audio_path, format='wav').run(quiet=True, overwrite_output=True)
        
        text = extract_text_from_audio(audio_path)
        os.remove(audio_path)  # Cleanup after extraction
        return text
    except Exception as e:
        return f"Error extracting text from Video: {str(e)}"

def extract_text_from_code(file_path):
    """Extract text from code files (.py, .cpp, .java) while ignoring encoding errors."""
    try:
        with open(file_path, 'r', encoding='utf-8', errors="ignore") as file:
            return file.read().strip()
    except Exception as e:
        return f"Error extracting text from Code file: {str(e)}"

def extract_text_from_url(url):
    """Extract text from a web page."""
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")
        return soup.get_text().strip()
    except Exception as e:
        return f"Error extracting text from URL: {str(e)}"

# ---------------------- UNIVERSAL TEXT EXTRACTOR ----------------------

def extract_text(file_path, file_type):
    """Extracts text from a given file based on its type."""
    file_type = file_type.lower()

    extractors = {
        "txt": extract_text_from_txt,
        "pdf": extract_text_from_pdf,
        "docx": extract_text_from_docx,
        "png": extract_text_from_image,
        "jpg": extract_text_from_image,
        "jpeg": extract_text_from_image,
        "mp3": extract_text_from_audio,
        "wav": extract_text_from_audio,
        "m4a": extract_text_from_audio,
        "mp4": extract_text_from_video,
        "avi": extract_text_from_video,
        "mkv": extract_text_from_video,
        "py": extract_text_from_code,
        "cpp": extract_text_from_code,
        "java": extract_text_from_code,
    }

    return extractors.get(file_type, lambda x: "Unsupported format")(file_path)
