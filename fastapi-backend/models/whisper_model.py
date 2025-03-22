import whisper

# Load Whisper model once
whisper_model = whisper.load_model("base")

def get_whisper_model():
    return whisper_model
