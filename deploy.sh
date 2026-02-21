#!/bin/bash

# Configuration
RPC_URL="http://127.0.0.1:8545"
DEPLOYMENT_FILE="deployment-info.txt"
FRONTEND_CONFIG="web/src/lib/contracts.ts"

echo "🚀 Starting Deployment to Anvil..."

# Check if Anvil is running
if ! curl -s $RPC_URL > /dev/null; then
    echo "❌ Error: Anvil is not running at $RPC_URL"
    exit 1
fi

# Run deployment script
cd sc
OUTPUT=$(forge script script/Deploy.s.sol:DeployScript --rpc-url $RPC_URL --broadcast -vvvv)
cd ..

# Extract addresses using grep and awk
ESCROW_ADDR=$(echo "$OUTPUT" | grep "Escrow deployed at:" | awk '{print $NF}')
TOKEN_A_ADDR=$(echo "$OUTPUT" | grep "TokenA deployed at:" | awk '{print $NF}')
TOKEN_B_ADDR=$(echo "$OUTPUT" | grep "TokenB deployed at:" | awk '{print $NF}')

echo "✅ Deployment Successful!"
echo "Escrow: $ESCROW_ADDR"
echo "Token A: $TOKEN_A_ADDR"
echo "Token B: $TOKEN_B_ADDR"

# Save to file
cat <<EOF > $DEPLOYMENT_FILE
Deployment Date: $(date)
Escrow: $ESCROW_ADDR
Token A: $TOKEN_A_ADDR
Token B: $TOKEN_B_ADDR
EOF

# Create frontend config directory if it doesn't exist
mkdir -p $(dirname $FRONTEND_CONFIG)

# Update frontend configuration
cat <<EOF > $FRONTEND_CONFIG
export const ESCROW_ADDRESS = "$ESCROW_ADDR";
export const TOKEN_A_ADDRESS = "$TOKEN_A_ADDR";
export const TOKEN_B_ADDRESS = "$TOKEN_B_ADDR";

export const ESCROW_ABI = $(cat sc/out/Escrow.sol/Escrow.json | jq '.abi');
export const ERC20_ABI = $(cat sc/out/MockERC20.sol/MockERC20.json | jq '.abi');
EOF

echo "📁 Frontend configuration updated in $FRONTEND_CONFIG"
