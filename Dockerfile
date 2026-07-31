FROM python:3.11-slim

# Create a non-root user (Hugging Face runs as UID 1000)
RUN useradd -m -u 1000 user
WORKDIR /app

# Copy requirements and install
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy source code
COPY backend/ ./backend/

# Ensure write permissions for the Hugging Face non-root user
RUN mkdir -p /app/backend/uploads /app/backend/cache && \
    chown -R user:user /app && \
    chmod -R 777 /app

USER user

# Set Hugging Face port
ENV PORT=7860
EXPOSE 7860

CMD ["python", "backend/main.py"]
