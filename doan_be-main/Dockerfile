# Base image
FROM node:18

# Tạo thư mục app
WORKDIR /app

# Copy package.json trước (tối ưu cache)
COPY package*.json ./

# Install deps
RUN npm install

# Copy source
COPY . .

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "run", "start"]