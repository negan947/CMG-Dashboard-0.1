#!/bin/bash

echo "🚀 Dashboard Performance Optimization Script"
echo "=========================================="

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

echo "📦 Step 1: Installing React Query dependencies..."
npm install @tanstack/react-query @tanstack/react-query-devtools

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "📋 Next steps to implement:"
echo ""
echo "1. Create Query Provider:"
echo "   - Create src/providers/query-provider.tsx"
echo "   - Add QueryProvider to app/layout.tsx"
echo ""
echo "2. Replace hooks with React Query versions:"
echo "   - Use the hooks in src/hooks/use-invoices-query.ts"
echo "   - Update components to use cached data"
echo ""
echo "3. Update Sidebar:"
echo "   - Replace Sidebar with OptimizedSidebar in DashboardLayout"
echo "   - This enables hover prefetching"
echo ""
echo "4. Add Performance Monitor (dev only):"
echo "   - Import PerformanceMonitor in your layout"
echo "   - Add it before closing body tag"
echo ""
echo "5. Test the improvements:"
echo "   - Navigate between pages"
echo "   - Check the performance monitor (bottom right)"
echo "   - Target: < 200ms navigation time"
echo ""
echo "📚 Full guide: docs/PERFORMANCE_OPTIMIZATION_GUIDE.md"
echo ""
echo "Would you like to see example code for any of these steps? (y/n)"

read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo "Example: Query Provider setup in app/layout.tsx:"
    echo ""
    echo "import { QueryProvider } from '@/providers/query-provider';"
    echo ""
    echo "export default function RootLayout({ children }) {"
    echo "  return ("
    echo "    <html>"
    echo "      <body>"
    echo "        <QueryProvider>"
    echo "          {children}"
    echo "        </QueryProvider>"
    echo "      </body>"
    echo "    </html>"
    echo "  );"
    echo "}"
fi

echo ""
echo "✨ Good luck with the optimization!" 