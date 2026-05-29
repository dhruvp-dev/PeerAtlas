import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("url");
  const filename = searchParams.get("filename") || "document.pdf";

  if (!fileUrl) {
    return new NextResponse("Missing URL parameter", { status: 400 });
  }

  try {
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    // Proxy the response stream and add Content-Disposition to force a download
    // with the desired filename instead of showing the raw URL in the browser.
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": response.headers.get("Content-Length") || "",
      },
    });
  } catch (error) {
    console.error("Download proxy error:", error);
    return new NextResponse("Error downloading file", { status: 500 });
  }
}
