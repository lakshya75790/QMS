# Use a base image
# FROM node:20-alpine AS base
FROM public.ecr.aws/docker/library/node:20-alpine AS base


# Setup builder stage
FROM base AS builder

WORKDIR /app

# Debugging: Log current directory
RUN echo "Current directory: $(pwd)"

# Copy only necessary files for dependency installation
COPY package.json pnpm-lock.yaml ./

# Debugging: List files in the working directory
RUN ls -al

# Install latest Corepack and enable it
RUN corepack prepare pnpm@10.17.1 --activate && corepack enable

# Debugging: Check Corepack installation
RUN corepack --version

# Install dependencies
RUN apk add --no-cache libc6-compat && \
    corepack enable && \
    pnpm install --frozen-lockfile

# Debugging: Verify installed dependencies
RUN pnpm list --depth 0

# Copy the rest of the application
COPY . .

# Debugging: List files after copying
RUN ls -al

# Disable telemetry and set production environment
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Inject environment variables at build time
ARG NEXT_PUBLIC_URL
ARG NEXT_PUBLIC_APP_VERSION
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ARG NEXT_PUBLIC_WEB_NAME
ARG NEXT_PUBLIC_WEB_MODE
ARG NEXT_PUBLIC_CLOUDINARY_API_KEY
ARG NEXT_PUBLIC_RAZORPAY_ID
ARG NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

ENV NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION
ENV NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ENV NEXT_PUBLIC_WEB_NAME=$NEXT_PUBLIC_WEB_NAME
ENV NEXT_PUBLIC_WEB_MODE=$NEXT_PUBLIC_WEB_MODE
ENV NEXT_PUBLIC_CLOUDINARY_API_KEY=$NEXT_PUBLIC_CLOUDINARY_API_KEY
ENV NEXT_PUBLIC_RAZORPAY_ID=$NEXT_PUBLIC_RAZORPAY_ID
ENV NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=$NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

# Debugging: Print environment variables
RUN echo "NEXT_PUBLIC_URL=${NEXT_PUBLIC_URL}" && \
    echo "NEXT_PUBLIC_APP_VERSION=${NEXT_PUBLIC_APP_VERSION}" && \
    echo "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=${NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}" && \
    echo "NEXT_PUBLIC_WEB_NAME=${NEXT_PUBLIC_WEB_NAME}" && \
    echo "NEXT_PUBLIC_WEB_MODE=${NEXT_PUBLIC_WEB_MODE}" && \
    echo "NEXT_PUBLIC_CLOUDINARY_API_KEY=${NEXT_PUBLIC_CLOUDINARY_API_KEY}" && \
    echo "NEXT_PUBLIC_RAZORPAY_ID=${NEXT_PUBLIC_RAZORPAY_ID}" && \
    echo "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=${NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}" 
    
# Build the application
RUN pnpm run build

# Debugging: Check if build output exists
RUN ls -al .next

# Setup runner stage
FROM base AS runner

WORKDIR /app

# Debugging: Log current directory
RUN echo "Runner stage: Current directory: $(pwd)"

# Disable telemetry and set production environment
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production


# Create a system user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

# Debugging: Check created user
RUN id nextjs

# Copy built files from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Debugging: Verify copied files
RUN ls -al

# Change to non-root user
USER nextjs

# Debugging: Print running user info
RUN whoami

# Expose the port
EXPOSE 3000 

# Start the application
CMD ["node", "server.js"]