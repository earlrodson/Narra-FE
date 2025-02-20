import { NextRequest, NextResponse } from "next/server";

// NOTE: you are expected to define the following environment variables in `.env.local`:
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;
const BUBBLE_VALIDATE = process.env.NEXT_PUBLIC_BUBBLE_VALIDATE;
const BUBBLE_BACKEND = process.env.NEXT_PUBLIC_BUBBLE_BACKEND;

// don't cache the results
export const revalidate = 0;

export type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  bubblebackend: string;
  bubblevalidate: string;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const uid = searchParams.get('uid') ? searchParams.get('uid') : `USERDEF${Math.floor(Math.random() * 10_000)}`;
    const cid = searchParams.get('cid') ? searchParams.get('cid') : `CONVERSATIONDEF${Math.floor(Math.random() * 10_000)}`;
    
    if (!uid || !cid) {
      throw new Error("Missing uid or cid parameter");
    }

    if (LIVEKIT_URL === undefined) {
      throw new Error("LIVEKIT_URL is not defined");
    }
    if (API_KEY === undefined) {
      throw new Error("LIVEKIT_API_KEY is not defined");
    }
    if (API_SECRET === undefined) {
      throw new Error("LIVEKIT_API_SECRET is not defined");
    }

    // Generate participant token
    const participantIdentity = `voice_assistant_user_${Math.floor(Math.random() * 10_000)}`;
    const roomName = `voice_assistant_room_${uid}_${cid}`;

    // Return connection details
    const data: ConnectionDetails = {
      serverUrl: LIVEKIT_URL,
      roomName,
      participantName: participantIdentity,
      bubblebackend: BUBBLE_BACKEND ?? "",
      bubblevalidate: BUBBLE_VALIDATE ?? "",
    };

    const headers = new Headers({
      "Cache-Control": "no-store",
    });
    
    return NextResponse.json(data, { headers });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return new NextResponse(error.message, { status: 500 });
    }
  }
}

