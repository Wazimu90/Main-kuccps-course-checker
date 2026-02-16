const fs = require('fs');
const path = require('path');

// Manually load .env.local because 'dotenv' might not handle .local by default
try {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');

    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            // Remove comments if any
            const cleanValue = value.split('#')[0].trim();
            process.env[key.trim()] = cleanValue;
        }
    });
} catch (e) {
    console.error("Error reading .env.local:", e.message);
}

const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || "";
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || "";
const MPESA_ENV = process.env.MPESA_ENV || "sandbox";
const MPESA_API_BASE_URL = MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

async function testAuth() {
    console.log("--- Starting M-Pesa Auth Test ---");
    console.log(`Environment: ${MPESA_ENV}`);
    console.log(`Base URL: ${MPESA_API_BASE_URL}`);

    if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
        console.error("Missing Consumer Key or Secret");
        return;
    }

    const key = MPESA_CONSUMER_KEY.trim();
    const secret = MPESA_CONSUMER_SECRET.trim();

    console.log(`Key Length: ${key.length}`);
    console.log(`Secret Length: ${secret.length}`);
    console.log(`Key Start: ${key.substring(0, 4)}****`);

    const credentials = Buffer.from(`${key}:${secret}`).toString("base64");

    try {
        const url = `${MPESA_API_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`;
        console.log(`Fetching: ${url}`);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Basic ${credentials}`,
            },
        });

        console.log(`Response Status: ${response.status} ${response.statusText}`);

        const contentType = response.headers.get("content-type");
        console.log(`Content-Type: ${contentType}`);

        const text = await response.text();
        console.log("Response Body (Raw):");
        console.log(text || "<empty>");

        try {
            const json = JSON.parse(text);
            console.log("Parsed JSON:", json);
            if (json.access_token) {
                console.log("SUCCESS: Access Token retrieved!");
            }
        } catch (e) {
            console.log("Response is not valid JSON.");
        }

    } catch (error) {
        console.error("Fetch Exception:", error);
    }
}

testAuth();
