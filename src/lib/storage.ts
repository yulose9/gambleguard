import { Storage } from "@google-cloud/storage";

// Helper to initialize storage
// Assumes GOOGLE_APPLICATION_CREDENTIALS is set in env or default auth matches
const storage = new Storage();

export async function uploadLogData(userId: string, data: any) {
    const bucketName = process.env.GCS_BUCKET_NAME;
    if (!bucketName) {
        throw new Error("GCS_BUCKET_NAME is not defined");
    }

    const bucket = storage.bucket(bucketName);
    const fileName = `user-logs/${userId}/${Date.now()}.json`;
    const file = bucket.file(fileName);

    try {
        await file.save(JSON.stringify(data, null, 2), {
            contentType: "application/json",
            metadata: {
                cacheControl: "no-cache",
            },
        });
        return `gs://${bucketName}/${fileName}`;
    } catch (error) {
        console.error("Error uploading to GCS:", error);
        throw error;
    }
}
