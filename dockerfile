FROM ubuntu:22.04

# Evita preguntas interactivas
ENV DEBIAN_FRONTEND=noninteractive

# Instala dependencias del sistema
RUN apt-get update && \
    apt-get install -y python python3-pip curl git build-essential \
    software-properties-common ffmpeg libsm6 libxext6 && \
    rm -rf /var/lib/apt/lists/*

# Instala Ganache CLI (requiere Node.js)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g ganache

# Instala dependencias de Python
RUN pip install --no-cache-dir web3 py-solc-x qrcode opencv-python
RUN pip3 install --no-cache-dir web3 py-solc-x qrcode opencv-python

# Crea directorio de trabajo
WORKDIR /app

# Copia el código fuente
COPY . /app

# Expone el puerto de Ganache
EXPOSE 8545

# Comando por defecto: inicia Ganache y deja la terminal abierta
CMD ganache -p 8545 --database.dbPath /data