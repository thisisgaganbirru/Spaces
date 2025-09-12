import axios from "axios";

// Test file upload functionality
async function testFileUpload() {
  try {
    console.log("🧪 Testing file upload functionality...");

    // Test data mimicking a PDF upload
    const testData = {
      type: "upload",
      data: {
        fileName: "test-document.pdf",
        fileType: "application/pdf",
        fileContent:
          "data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsKsw7sNCjIgMCBvYmoKPDwvVHlwZS9YUmVmL1NpemUgMy9XWzEgMCAyXS9Sb290IDEgMCBSL0luZm8gMiAwIFIvSUQgWzw4RjE0QTZBOUMyQkE0M0MzQTg5MDg4MDYzOEYyRDVCND48OEYxNEE2QTlDMkJBNDNDM0E4OTA4ODA2MzhGMkQ1QjQ+XS9GaWx0ZXJbL0ZsYXRlRGVjb2RlXT4+CnN0cmVhbQp4nCNVQkBWQkZaTklBcmlJQjATQkFSUF5BUkhYQUFYWUG=",
        description: "Test PDF upload",
      },
    };

    // Make request to upload
    const response = await axios.post(
      "http://localhost:3001/api/spaces/SPACE_test/content",
      testData
    );

    console.log("✅ Upload successful!");
    console.log("Response:", JSON.stringify(response.data, null, 2));

    // Test retrieving content
    const contentResponse = await axios.get(
      "http://localhost:3001/api/spaces/SPACE_test/content"
    );
    console.log("✅ Content retrieval successful!");
    console.log("Content count:", contentResponse.data.length);
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

testFileUpload();
