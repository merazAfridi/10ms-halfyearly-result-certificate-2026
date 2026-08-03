CREATE TABLE public.result_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_name TEXT NOT NULL,
  school_name TEXT NOT NULL,
  preparation_type TEXT NOT NULL,
  exam_name TEXT NOT NULL,
  total_marks NUMERIC NOT NULL,
  class_position INTEGER NOT NULL,
  result_card_url TEXT,
  class_name TEXT,
  exam_total_marks NUMERIC,
  student_phone TEXT,
  student_email TEXT,
  external_user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.result_submissions TO anon, authenticated;
GRANT SELECT (id, certificate_name, school_name, preparation_type, exam_name, class_name, total_marks, exam_total_marks, class_position, created_at)
  ON public.result_submissions TO anon, authenticated;
GRANT ALL ON public.result_submissions TO service_role;

ALTER TABLE public.result_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a result"
ON public.result_submissions FOR INSERT TO anon, authenticated
WITH CHECK (
  length(certificate_name) BETWEEN 1 AND 100
  AND length(school_name) BETWEEN 1 AND 150
  AND total_marks >= 0 AND total_marks <= 2000
  AND class_position >= 1 AND class_position <= 500
);

CREATE POLICY "Anyone can view certificates"
ON public.result_submissions FOR SELECT TO anon, authenticated
USING (true);

CREATE UNIQUE INDEX IF NOT EXISTS result_submissions_one_per_user
  ON public.result_submissions (external_user_id)
  WHERE external_user_id IS NOT NULL;