FROM node:20-slim

# Install yt-dlp + ffmpeg (needed for audio format conversion)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    wget \
    ca-certificates \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp binary directly from GitHub releases (faster than pip)
RUN wget -q -O /usr/local/bin/yt-dlp \
    https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    && chmod +x /usr/local/bin/yt-dlp

# Verify install
RUN yt-dlp --version

WORKDIR /app
COPY package.json .
COPY server.js .

# Cloud Run injects PORT=8080 automatically
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
