FROM denoland/deno:alpine-1.21.2

EXPOSE 3002

WORKDIR /app

# Cache the dependencies as a layer (the following two steps are re-run only when deps.ts is modified).
# Ideally cache deps.ts will download and compile _all_ external files used in cmd.ts.
COPY deps.ts .
RUN deno --unstable cache deps.ts

# These steps will be re-run upon each file change in your working directory:
ADD . .

# Generate key used for JWT signing and verifying
RUN deno run -A --unstable bin/cmd.ts generate-key

# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno --unstable cache bin/cmd.ts

# Start AuthC API Server
CMD [ "run", "-A", "--unstable", "bin/cmd.ts" ]
