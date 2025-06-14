# Use the latest lightweight Ubuntu as the base image
FROM ubuntu:latest

# Install Node.js 22, Python 3, PHP, MariaDB Server, and other dependencies
RUN apt-get update && \
    apt-get install -y curl ca-certificates python3 python3-pip php php-cli mariadb-server && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Create developer user and set up home directory
RUN useradd -ms /bin/bash developer

# Create persistent storage directories for app and MySQL
VOLUME ["/home/developer/app", "/var/lib/mysql"]

# Set up MariaDB with environment variables
ENV MYSQL_HOST=localhost
ENV MYSQL_USER=root
ENV MYSQL_PASSWORD=your_password_here
ENV MYSQL_DATABASE=mcp_db

# Initialize MariaDB database and set root password
RUN service mysql start && \
    mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '${MYSQL_PASSWORD}'; FLUSH PRIVILEGES;" && \
    mysql -u root -p${MYSQL_PASSWORD} -e "CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\`;"

# Set working directory to developer's home
WORKDIR /home/developer/app

# Change ownership of app and MySQL data to developer
RUN chown -R developer:developer /home/developer /var/lib/mysql

# Copy project files to persistent app directory
COPY . /home/developer/app
COPY .env /home/developer/app/.env

# Install dependencies as developer
USER developer
RUN cd /home/developer/app && npm install || true

# Switch back to root to start services
USER root

# Expose the default MCP port (can be overridden by env)
EXPOSE 1234

# Start both MariaDB and the MCP server as developer
CMD service mysql start && su developer -c "cd /home/developer/app && node developer.mjs"
