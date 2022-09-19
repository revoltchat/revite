#!/bin/bash
# Build and publish release to production server

# Remote Server
REMOTE=revolt-de-nrb-1

# Remote Directory
REMOTE_DIR=/root/revite

# Post-install script
POST_INSTALL="pm2 restart revite"

# Assets
export REVOLT_SAAS=https://github.com/revoltchat/assets


# Exit when any command fails
set -e

# 1. Make sure everything is present and up to date
pnpm i

# 2. Build Revite
npm run build:all

# 3. Archive built files
tar -czvf build.tar.gz dist

# 4. Upload built files
scp build.tar.gz $REMOTE:$REMOTE_DIR/build.tar.gz
rm build.tar.gz

# 5. Apply changes
ssh $REMOTE "cd $REMOTE_DIR; tar -xvzf build.tar.gz; rm build.tar.gz; $POST_INSTALL"

