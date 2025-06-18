# Use the latest lightweight Ubuntu as the base image
FROM ubuntu:latest

# Install Node.js 22, Python 3, PHP, and other dependencies (no MariaDB)
RUN apt-get update && \
    apt-get install -y curl ca-certificates python3 python3-pip php php-cli && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Create developer user and set up home directory
RUN useradd -ms /bin/bash developer

# Create persistent storage directory for app
VOLUME ["/home/developer/app"]

# Set working directory to developer's home
WORKDIR /home/developer/app

# Change ownership of app directory to developer
RUN chown -R developer:developer /home/developer

# Copy project files to persistent app directory
COPY . /home/developer/app
COPY .env /home/developer/app/.env

# Install dependencies as developer
USER developer
RUN cd /home/developer/app && npm install || true

# Expose the default MCP port (can be overridden by env)
EXPOSE 1234

# Start the MCP server as developer
CMD ["node", "developer.mjs"]
