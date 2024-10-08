import FingerprintJS from '@fingerprintjs/fingerprintjs';

export async function generateDeviceId(): Promise<string> {
    // Try to get the stored device ID
    let deviceId = localStorage.getItem('deviceId');

    if (!deviceId) {
        // If no stored ID, generate a new one
        const fpPromise = FingerprintJS.load();
        const fp = await fpPromise;
        const result = await fp.get();
        // Combine fingerprint with a UUID for added uniqueness
        deviceId = `${result.visitorId}`;
        console.log("Device ID in fingerprint.ts:", deviceId);

        // Store the new device ID
        localStorage.setItem('deviceId', deviceId);
    }

    return deviceId;
}