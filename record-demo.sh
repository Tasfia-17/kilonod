#!/bin/bash

# Demo script for creating a GIF of Kilo-Nod in action

cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║                  Kilo-Nod Demo Recording                     ║
╚══════════════════════════════════════════════════════════════╝

This script helps you create a demo GIF for the README.

Prerequisites:
  - asciinema (for terminal recording)
  - agg (for converting to GIF)
  
Install:
  # Linux
  sudo apt install asciinema
  cargo install agg
  
  # macOS
  brew install asciinema
  cargo install agg

Recording Steps:
  1. Start recording: asciinema rec demo.cast
  2. Run: npm run dev
  3. Wait for "Server running" message
  4. Open browser to http://localhost:3000
  5. In another terminal: npm run mock
  6. Demonstrate:
     - Permission appearing
     - Press 'A' to approve
     - Press 'R' to reject
     - Press '1' for auto-approve
     - Show history
  7. Stop recording: Ctrl+D

Convert to GIF:
  agg demo.cast demo.gif

Alternative (for GUI recording):
  - Linux: peek, byzanz-record
  - macOS: Kap, Gifox  
  - Windows: ScreenToGif

Recommended settings:
  - Resolution: 1280x720
  - FPS: 15
  - Duration: 30-60 seconds
  - Show keyboard shortcuts in action

EOF

read -p "Start recording now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v asciinema &> /dev/null; then
        echo "Starting asciinema recording..."
        echo "Press Ctrl+D when done"
        asciinema rec demo.cast
        
        if [ -f demo.cast ]; then
            echo "✓ Recording saved to demo.cast"
            
            if command -v agg &> /dev/null; then
                echo "Converting to GIF..."
                agg demo.cast demo.gif
                echo "✓ GIF saved to demo.gif"
            else
                echo "Install 'agg' to convert to GIF: cargo install agg"
            fi
        fi
    else
        echo "Please install asciinema first"
        echo "  Linux: sudo apt install asciinema"
        echo "  macOS: brew install asciinema"
    fi
fi
