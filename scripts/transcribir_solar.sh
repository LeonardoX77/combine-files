#!/bin/bash

# Ruta al binario whisper-cli
WHISPER=~/Documents/whisper.cpp/build/bin/whisper-cli

# Ruta al modelo que quieres usar (medium en este caso)
MODEL=~/Documents/whisper.cpp/models/ggml-medium.bin

# Carpeta donde tienes los audios
AUDIO_DIR=~/tmp/solar

# Número de hilos de CPU
THREADS=12

# Idioma
LANGUAGE=es

# Vamos al directorio de audios
cd "$AUDIO_DIR"

# Procesamos cada .mp3
for file in *.mp3; do
    echo "Transcribiendo $file..."
    "$WHISPER" -m "$MODEL" -f "$file" -t "$THREADS" -l "$LANGUAGE" -otxt
done

echo "✅ Todas las transcripciones completadas."
