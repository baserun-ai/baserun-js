#!/bin/bash

# Path to the destination project directory
DEST_PROJECT_DIR="/Users/timsuchanek/code/rag/talk-to-pdf"

# Function to handle file changes
on_change() {
  # Run npm pack and store the generated tarball name
  TARBALL=$(npm pack | tail -1)

  # Go to the destination project directory
  cd $DEST_PROJECT_DIR

  # Install the tarball using npm install
  npm install "/Users/timsuchanek/code/baserun-js/$TARBALL"
}

# Watch for changes in the ./src directory using fswatch
fswatch -o ./src | while read -r num; do
  echo "Detected changes in ./src"
  on_change
done