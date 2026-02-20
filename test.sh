#!/bin/bash

# Kilo-Nod Test Suite

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              Kilo-Nod Test Suite                             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

test_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((TESTS_PASSED++))
}

test_fail() {
    echo -e "${RED}✗${NC} $1"
    ((TESTS_FAILED++))
}

test_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Test 1: Check Node.js
echo "Test 1: Node.js Installation"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    test_pass "Node.js found: $NODE_VERSION"
else
    test_fail "Node.js not found"
fi
echo ""

# Test 2: Check npm
echo "Test 2: npm Installation"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    test_pass "npm found: $NPM_VERSION"
else
    test_fail "npm not found"
fi
echo ""

# Test 3: Check project structure
echo "Test 3: Project Structure"
REQUIRED_FILES=(
    "package.json"
    "server/index.js"
    "web/package.json"
    "web/src/App.jsx"
    "web/src/main.jsx"
    "web/src/index.css"
    "web/src/components/PermissionCard.jsx"
    "web/src/components/StatusBar.jsx"
    "web/src/components/History.jsx"
    "web/src/hooks/useWebSocket.js"
    "web/src/hooks/useKeyboard.js"
    "mock/kilo-mock.js"
    "README.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        test_pass "$file exists"
    else
        test_fail "$file missing"
    fi
done
echo ""

# Test 4: Check file permissions
echo "Test 4: File Permissions"
EXECUTABLE_FILES=(
    "setup.sh"
    "record-demo.sh"
    "mock/kilo-mock.js"
)

for file in "${EXECUTABLE_FILES[@]}"; do
    if [ -x "$file" ]; then
        test_pass "$file is executable"
    else
        test_fail "$file is not executable"
    fi
done
echo ""

# Test 5: Validate JSON files
echo "Test 5: JSON Validation"
JSON_FILES=(
    "package.json"
    "web/package.json"
)

for file in "${JSON_FILES[@]}"; do
    if node -e "JSON.parse(require('fs').readFileSync('$file', 'utf8'))" 2>/dev/null; then
        test_pass "$file is valid JSON"
    else
        test_fail "$file has invalid JSON"
    fi
done
echo ""

# Test 6: Check server code
echo "Test 6: Server Code Validation"
if node -c server/index.js 2>/dev/null; then
    test_pass "server/index.js syntax is valid"
else
    test_fail "server/index.js has syntax errors"
fi
echo ""

# Test 7: Check mock code
echo "Test 7: Mock Code Validation"
if node -c mock/kilo-mock.js 2>/dev/null; then
    test_pass "mock/kilo-mock.js syntax is valid"
else
    test_fail "mock/kilo-mock.js has syntax errors"
fi
echo ""

# Test 8: Check documentation
echo "Test 8: Documentation"
DOC_FILES=(
    "README.md"
    "QUICKSTART.md"
    "SUMMARY.md"
    "FEATURES.md"
)

for file in "${DOC_FILES[@]}"; do
    if [ -f "$file" ] && [ -s "$file" ]; then
        test_pass "$file exists and is not empty"
    else
        test_fail "$file missing or empty"
    fi
done
echo ""

# Test 9: Check GitHub Actions
echo "Test 9: GitHub Actions"
if [ -f ".github/workflows/build.yml" ]; then
    test_pass "GitHub Actions workflow exists"
else
    test_fail "GitHub Actions workflow missing"
fi
echo ""

# Test 10: Check gitignore
echo "Test 10: Git Configuration"
if [ -f ".gitignore" ]; then
    if grep -q "node_modules" .gitignore; then
        test_pass ".gitignore includes node_modules"
    else
        test_fail ".gitignore missing node_modules"
    fi
else
    test_fail ".gitignore missing"
fi
echo ""

# Summary
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                      Test Summary                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Passed:${NC} $TESTS_PASSED"
echo -e "${RED}Failed:${NC} $TESTS_FAILED"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Install dependencies: ./setup.sh"
    echo "  2. Start the system: npm run dev"
    echo "  3. Test with mock: npm run mock"
    echo "  4. Open browser: http://localhost:3000"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    echo ""
    echo "Please fix the issues above before proceeding."
    exit 1
fi
