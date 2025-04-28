ffmpeg -i 1.mp4 -q:a 0 -map a 1.mp3

# Ejecuta el programa whisper-cli (compilado en whisper.cpp)
~/Documents/whisper.cpp/build/bin/whisper-cli \
  # Especifica el modelo que va a usar para la transcripción (modelo 'medium')
  -m ~/Documents/whisper.cpp/models/ggml-medium.bin \
  # Especifica el archivo de audio que quieres transcribir (cambia 'unicaja.mp3' por el archivo que quieras)
  -f ~/Documents/unicaja.mp3 \
  # Indica que se usen 12 hilos de CPU (ideal para tu Mac M2 de 16 núcleos)
  -t 12 \
  # Fuerza el idioma español ('es') para mejorar la precisión
  -l es \
  # Guarda automáticamente el resultado en un archivo .txt (sin necesidad de copiar y pegar de la terminal)
  -otxt

