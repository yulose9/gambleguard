import { NextResponse } from "next/server";
import { uploadLogData } from "@/lib/storage";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { logs, userId } = body;

        // Proactive validation
        if (!logs || !userId) {
            return NextResponse.json(
                { error: "Missing logs or userId" },
                { status: 400 }
            );
        }

        // Attempt upload
        // If GCS_BUCKET_NAME is not set, this might fail, so we wrap in try/catch to warn but not crash client entirely logic
        if (!process.env.GCS_BUCKET_NAME) {
            console.warn("GCS_BUCKET_NAME not set. Skipping cloud upload.");
            return NextResponse.json({ message: "Cloud upload skipped (Configuration missing)", success: false });
        }

        const fileUrl = await uploadLogData(userId, logs);

        return NextResponse.json({ success: true, url: fileUrl });
    } catch (error) {
        console.error("Backup failed:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: String(error) },
            { status: 500 }
        );
    }
}
