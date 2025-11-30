import sql from "@/app/api/utils/sql";
import { sendEmail } from "@/app/api/utils/send-email";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: "Please provide a valid email address" },
        { status: 400 },
      );
    }

    // Validate field lengths
    if (name.length > 255) {
      return Response.json(
        { error: "Name must be less than 255 characters" },
        { status: 400 },
      );
    }

    if (email.length > 255) {
      return Response.json(
        { error: "Email must be less than 255 characters" },
        { status: 400 },
      );
    }

    if (message.length > 5000) {
      return Response.json(
        { error: "Message must be less than 5000 characters" },
        { status: 400 },
      );
    }

    // Insert the submission into the database
    const result = await sql`
      INSERT INTO contact_submissions (name, email, message)
      VALUES (${name}, ${email}, ${message})
      RETURNING id, created_at
    `;

    const submissionId = result[0].id;

    // Send email notification
    try {
      await sendEmail({
        to: process.env.CONTACT_NOTIFICATION_EMAIL || "admin@yourdomain.com",
        from: "notifications@yourdomain.com", // Change this to your verified domain
        subject: `New Contact Form Submission from ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #3B82F6; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            
            <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Contact Information</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #3B82F6;">${email}</a></p>
              <p><strong>Submission ID:</strong> #${submissionId}</p>
              <p><strong>Date:</strong> ${new Date(result[0].created_at).toLocaleString()}</p>
            </div>

            <div style="background-color: #FFFFFF; padding: 20px; border: 1px solid #E5E7EB; border-radius: 8px;">
              <h3 style="color: #374151; margin-top: 0;">Message</h3>
              <p style="line-height: 1.6; color: #4B5563;">${message}</p>
            </div>

            <div style="margin-top: 20px; padding: 15px; background-color: #EBF8FF; border-radius: 6px;">
              <p style="margin: 0; color: #2563EB; font-size: 14px;">
                💡 You can reply directly to ${email} or manage submissions in your 
                <a href="${process.env.APP_URL}/admin" style="color: #1D4ED8;">admin dashboard</a>.
              </p>
            </div>
          </div>
        `,
        text: `
New Contact Form Submission

From: ${name} (${email})
Submission ID: #${submissionId}
Date: ${new Date(result[0].created_at).toLocaleString()}

Message:
${message}

---
Reply to: ${email}
Manage submissions: ${process.env.APP_URL}/admin
        `,
      });
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Don't fail the entire request if email fails
      // Just log the error and continue
    }

    return Response.json({
      success: true,
      message: "Thank you for your message! We will get back to you soon.",
      id: result[0].id,
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return Response.json(
      { error: "Failed to submit your message. Please try again." },
      { status: 500 },
    );
  }
}
