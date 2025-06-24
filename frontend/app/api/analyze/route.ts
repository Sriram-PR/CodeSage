import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    
    // Simulate API processing time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create a more noticeable optimization
    const optimizedCode = code
      // Add console.log statements
      .replace(/function/g, "// Added logging\nconsole.log(\'Function called\');\nfunction")
      // Add async/await where possible
      .replace(/function (\w+)/g, "async function $1")
      // Add error handling
      .replace(/{/g, "{\ntry {")
      .replace(/}/g, "} catch (error) {\n  console.error(error);\n  throw error;\n}}")
      // Add comments
      .split('\n')
      .map(line => line.trim() ? `// Optimized:\n${line}` : line)
      .join('\n');

    const analysisResult = {
      codeReview: `### Code Review Analysis

#### Code Structure
- ✅ Good use of TypeScript interfaces
- ⚠️ Consider breaking down large components into smaller ones
- 📝 Component naming follows React conventions

#### Best Practices
- ✅ Proper use of React hooks
- ⚠️ useEffect dependencies could be optimized
- 📝 Consider implementing error boundaries`,

      bugDetection: [
        {
          title: "Memory Leak Risk",
          description: "Event listeners in useEffect hooks should be properly cleaned up"
        },
        {
          title: "State Update Race Condition",
          description: "Multiple state updates might cause race conditions. Consider using useReducer"
        },
        {
          title: "Accessibility Issue",
          description: "Some interactive elements are missing ARIA labels"
        }
      ],

      optimization: {
        optimizedCode,
        explanation: `### Optimization Changes Made

1. **Added Logging**
   - Inserted console.log statements for better debugging
   - Added function entry point logging

2. **Error Handling**
   - Wrapped code blocks in try-catch statements
   - Added proper error logging

3. **Async/Await**
   - Converted functions to async where applicable
   - Improved promise handling

4. **Documentation**
   - Added inline comments for better code readability
   - Documented code changes`
      }
    };

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze code" },
      { status: 500 }
    );
  }
} 