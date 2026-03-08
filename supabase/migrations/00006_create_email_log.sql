-- Create email log table
CREATE TABLE public.email_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    email_type TEXT NOT NULL,
    subject TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
    metadata JSONB
);

CREATE INDEX idx_email_log_user ON public.email_log(user_id);
CREATE INDEX idx_email_log_type ON public.email_log(email_type);
