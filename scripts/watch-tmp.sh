#!/bin/bash

set -ex

# Create a random temporary directory in /tmp
TMP_DIR=$(mktemp -d /tmp/tmp.XXXXXXXXXX)

# Path to the destination project directory
DEST_PROJECT_DIR="/Users/timsuchanek/code/rag/talk-to-pdf"

# Function to handle file changes
on_change() {
  # Run npm pack and store the generated tarball name
  TARBALL=$(npm pack | tail -1)

  # Move the tarball to the temporary directory
  mv $TARBALL $TMP_DIR/

  # Go to the destination project directory
  cd $DEST_PROJECT_DIR

  # Install the tarball using npm install
  npm install "$TMP_DIR/$TARBALL"
}

# Watch for changes in the ./src directory using fswatch
fswatch -o ./src | while read -r num; do
  echo "Detected changes in ./src"
  on_change
done
