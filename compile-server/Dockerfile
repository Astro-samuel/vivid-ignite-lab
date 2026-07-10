FROM node:20-slim

RUN apt-get update && apt-get install -y curl ca-certificates && rm -rf /var/lib/apt/lists/*

# Install arduino-cli
RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh -s -- v1.0.4 \
  && mv bin/arduino-cli /usr/local/bin/arduino-cli

# Install the AVR core used by Arduino Uno/Nano/Mini (ATmega328P)
RUN arduino-cli core update-index \
  && arduino-cli core install arduino:avr

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.js ./

ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]
