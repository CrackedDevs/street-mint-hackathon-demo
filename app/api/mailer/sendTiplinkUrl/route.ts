import { sendTipLinkUrlMail } from '@/lib/nodemailer';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { email, tiplinkUrl } = await req.json();


        if (!email || !tiplinkUrl) {
            return NextResponse.json(
                { success: false, error: "Missing email or tiplinkUrl" },
                { status: 400 }
            );
        }
        const mail = await sendTipLinkUrlMail(email, tiplinkUrl)
        console.log(mail)
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error sending TipLink URL:", error);
        return NextResponse.json(
            { success: false, error: "Failed to send TipLink URL" },
            { status: 500 }
        );
    }
}
