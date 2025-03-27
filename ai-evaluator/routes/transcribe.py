from fastapi import APIRouter, UploadFile, File
from services.transcription import extract_text
from tempfile import NamedTemporaryFile

router = APIRouter()

transcribe_desc = "API endpoint to extract text from uploaded files. It supports multi-format files including audio, video, images, PDF, DOCX, text, etc. Additionally, it enables multilingual text extraction for languages such as English, Hindi, Urdu, Bengali, and more."

@router.post("/transcribe/", summary="Transcribe text from uploaded files", description=transcribe_desc)
async def transcribe_file(file: UploadFile = File(...)):
    """API endpoint to extract text from uploaded files."""
    
    # Save file temporarily
    with NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
        temp_file.write(file.file.read())
        temp_path = temp_file.name

    file_type = file.filename.split(".")[-1]
    extracted_text = extract_text(temp_path, file_type)

    return {"filename": file.filename, "extracted_text": extracted_text}
