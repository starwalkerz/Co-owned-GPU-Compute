#!/bin/bash
# ============================================================
# HPC Share - Installation Script (Linux/macOS)
# ============================================================

set -e

echo "============================================================"
echo "HPC SHARE - INSTALLATION SCRIPT"
echo "============================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js v18+${NC}"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version $NODE_VERSION detected. Please upgrade to v18+${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found. Please reinstall Node.js${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v) detected${NC}"

# Check Git
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}⚠️ Git not found. Please install git for version control${NC}"
fi

# Create .env if not exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠️ Please edit .env with your API keys and addresses${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
    fi
else
    echo -e "${GREEN}✅ .env already exists${NC}"
fi

# Install dependencies
echo -e "${GREEN}📦 Installing npm dependencies...${NC}"
npm install

# Create necessary directories
echo -e "${GREEN}📁 Creating directories...${NC}"
mkdir -p config logs reports

# Create default config files if not exist
if [ ! -f config/investors.json ]; then
    echo '[]' > config/investors.json
    echo -e "${GREEN}✅ Created config/investors.json${NC}"
fi

if [ ! -f config/revenue.json ]; then
    cat > config/revenue.json << EOF
{
    "period": "Q1 2027",
    "nosAmount": 0,
    "usdcAmount": 0,
    "operatingExpenses": 0,
    "managementFee": 0,
    "netDistribution": 0
}
EOF
    echo -e "${GREEN}✅ Created config/revenue.json${NC}"
fi

# Compile contracts (if Hardhat is configured)
if [ -f hardhat.config.js ]; then
    echo -e "${GREEN}🔨 Compiling smart contracts...${NC}"
    npx hardhat compile
fi

# Run tests (if available)
if [ -d test ]; then
    echo -e "${GREEN}🧪 Running tests...${NC}"
    npx hardhat test || echo -e "${YELLOW}⚠️ Some tests may fail if contracts not deployed${NC}"
fi

# Interface setup
if [ -d interface ]; then
    echo -e "${GREEN}🌐 Setting up interface...${NC}"
    cd interface
    if [ ! -d node_modules ]; then
        npm install
    fi
    cd ..
fi

echo ""
echo "============================================================"
echo -e "${GREEN}✅ INSTALLATION COMPLETE!${NC}"
echo "============================================================"
echo ""
echo "📋 Next steps:"
echo "   1. Edit .env with your API keys"
echo "   2. Run setup wizard: open interface/setup.html in browser"
echo "   3. Or deploy manually: npx hardhat run scripts/deploy.js --network polygon"
echo "   4. Start interface: cd interface && npx serve . -p 3000"
echo "   5. Open browser to http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "   - User Guide: docs/user-guide.md"
echo "   - Admin Guide: docs/admin-guide.md"
echo "   - API Reference: docs/api-reference.md"
echo ""