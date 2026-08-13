import { createServerFn } from "@tanstack/react-start";

export const fetchSubmissionsFn = createServerFn({ method: "GET" })
  .inputValidator((input?: { limit?: number }) => {
    return { limit: input?.limit ?? 300 };
  })
  .handler(async ({ data }) => {
    const { getResultSubmissions } = await import("./d1.server");
    return getResultSubmissions(data.limit);
  });

export const submitResultFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      certificate_name: string;
      class_name?: string | null;
      school_name: string;
      preparation_type: string;
      exam_name: string;
      total_marks: number;
      exam_total_marks?: number | null;
      class_position: number;
      result_card_url?: string | null;
      student_phone?: string | null;
      student_email?: string | null;
      external_user_id?: string | null;
    }) => {
      if (!input?.certificate_name?.trim()) throw new Error("Certificate name is required");
      if (!input?.school_name?.trim()) throw new Error("School name is required");
      if (!input?.exam_name?.trim()) throw new Error("Exam name is required");

      return {
        certificate_name: input.certificate_name.trim(),
        class_name: input.class_name ?? null,
        school_name: input.school_name.trim(),
        preparation_type: input.preparation_type,
        exam_name: input.exam_name,
        total_marks: Number(input.total_marks),
        exam_total_marks: input.exam_total_marks ? Number(input.exam_total_marks) : null,
        class_position: Number(input.class_position),
        result_card_url: input.result_card_url ?? null,
        student_phone: input.student_phone ?? null,
        student_email: input.student_email ?? null,
        external_user_id: input.external_user_id ?? null,
      };
    },
  )
  .handler(async ({ data }) => {
    const { insertResultSubmission } = await import("./d1.server");
    return insertResultSubmission(data);
  });
