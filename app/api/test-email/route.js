import { sendEmail } from "@/lib/email/mailer";

export async function GET() {
    await sendEmail({
        to: "thakurankeshkumar9@gmail.com", // friend / alt / temp
        subject: "SMTP Test External",
        html: "<h1>Email system works</h1>",
    });


    return Response.json({ message: "Email sent" });
}
