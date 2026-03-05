#!/bin/bash

# Configuration
SESSION="escrow-dev"
STATE_FILE="./anvil_state.json"
BASE_DIR=$(pwd)

# Verify we are in the right directory
if [ ! -d "sc" ] || [ ! -d "web" ]; then
    echo "Error: Please run this script from the project root."
    exit 1
fi

# Kill old session if exists
tmux kill-session -t $SESSION 2>/dev/null

# Create new session
tmux new-session -d -s $SESSION

# Panel 1 (Left): Anvil with Persistence
# We use --state to save and load the blockchain state
tmux rename-window -t $SESSION:0 'Escrow Dashboard'
tmux send-keys -t $SESSION:0 "anvil --state $STATE_FILE" C-m

# Panel 2 (Right): Next.js Dev Server
tmux split-window -h -t $SESSION:0
tmux send-keys -t $SESSION:0 "cd web && npm run dev" C-m

# Adjust layout (50/50 split)
tmux select-layout -t $SESSION:0 even-horizontal

# Attach to session
tmux attach-session -t $SESSION
