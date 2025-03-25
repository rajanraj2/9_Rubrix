import os
import pytesseract
import docx
import requests
import speech_recognition as sr
import moviepy.editor as mp
from PyPDF2 import PdfReader
from PIL import Image
from bs4 import BeautifulSoup
from models.whisper_model import get_whisper_model
from fastapi import UploadFile
from tempfile import NamedTemporaryFile

whisper_model = get_whisper_model()

# ---------------------- TEXT EXTRACTION FUNCTIONS ----------------------

def extract_text_from_txt(file_path):
    """Extract text from .txt files."""
    with open(file_path, 'r', encoding='utf-8') as file:
        return file.read()

def extract_text_from_pdf(file_path):
    """Extract text from .pdf files."""
    text = ""
    reader = PdfReader(file_path)
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text.strip()

def extract_text_from_docx(file_path):
    """Extract text from .docx files."""
    doc = docx.Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])

def extract_text_from_image(image_path):
    """Extract text from image files using OCR."""
    image = Image.open(image_path)
    return pytesseract.image_to_string(image)

def extract_text_from_audio(audio_path):
    """Extract text from audio files using Whisper."""
    result = whisper_model.transcribe(audio_path)
    return result["text"].strip()

def extract_text_from_video(video_path):
    """Extract text from video files by converting to audio first."""
    try:
        video = mp.VideoFileClip(video_path)
        audio_path = f"{video_path}_temp_audio.wav"
        video.audio.write_audiofile(audio_path, codec='pcm_s16le', verbose=False, logger=None)
        text = extract_text_from_audio(audio_path)
        if os.path.exists(audio_path):
            os.remove(audio_path)  # Clean up
        return text
    except Exception as e:
        # Log the error, but don't raise to allow for graceful handling
        print(f"Error processing video: {str(e)}")
        return f"Error extracting audio from video: {str(e)}"

def extract_text_from_code(file_path):
    """Extract text from code files (.py, .cpp, .java)."""
    with open(file_path, 'r', encoding='utf-8') as file:
        return file.read()

def extract_text_from_url(url):
    """Extract text from a web page."""
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    return soup.get_text()

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
        "mov": extract_text_from_video,
        "webm": extract_text_from_video,
        "py": extract_text_from_code,
        "cpp": extract_text_from_code,
        "java": extract_text_from_code,
    }

    extractor = extractors.get(file_type)
    if extractor:
        try:
            return extractor(file_path)
        except Exception as e:
            print(f"Error extracting text from {file_type} file: {str(e)}")
            return f"Error processing file: {str(e)}"
    else:
        return "Unsupported format"
