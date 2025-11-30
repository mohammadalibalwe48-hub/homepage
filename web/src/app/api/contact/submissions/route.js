import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const countResult = await sql`
      SELECT COUNT(*) as total 
      FROM contact_submissions
    `;
    const total = parseInt(countResult[0].total);

    // Get submissions with pagination
    const submissions = await sql`
      SELECT id, name, email, message, created_at
      FROM contact_submissions
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return Response.json({
      success: true,
      data: submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching contact submissions:", error);
    return Response.json(
      { error: "Failed to fetch submissions" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json(
        { error: "Submission ID is required" },
        { status: 400 },
      );
    }

    const result = await sql`
      DELETE FROM contact_submissions
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return Response.json({ error: "Submission not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      message: "Submission deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting contact submission:", error);
    return Response.json(
      { error: "Failed to delete submission" },
      { status: 500 },
    );
  }
}
