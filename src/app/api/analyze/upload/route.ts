import {
  handleUpload,
  type HandleUploadBody,
} from "@vercel/blob/client";
import { NextResponse } from "next/server";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Blob storage not configured. Add BLOB_READ_WRITE_TOKEN." },
      { status: 503 }
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, _clientPayload, multipart) => {
        return {
          allowedContentTypes: ["application/pdf"],
          maximumSizeInBytes: MAX_SIZE,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
