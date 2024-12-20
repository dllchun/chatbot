-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.insert_conversation;

-- Create the insert_conversation function
CREATE OR REPLACE FUNCTION public.insert_conversation(
    p_id TEXT,
    p_chatbot_id TEXT,
    p_source TEXT,
    p_whatsapp_number TEXT DEFAULT NULL,
    p_customer TEXT DEFAULT NULL,
    p_messages JSONB DEFAULT '[]'::jsonb,
    p_min_score FLOAT DEFAULT NULL,
    p_form_submission JSONB DEFAULT NULL,
    p_country TEXT DEFAULT NULL,
    p_last_message_at TIMESTAMPTZ DEFAULT NULL
) RETURNS public.conversations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result public.conversations;
BEGIN
    INSERT INTO public.conversations (
        id,
        chatbot_id,
        source,
        whatsapp_number,
        customer,
        messages,
        min_score,
        form_submission,
        country,
        last_message_at
    ) VALUES (
        p_id,
        p_chatbot_id,
        p_source,
        p_whatsapp_number,
        p_customer,
        p_messages,
        p_min_score,
        p_form_submission,
        p_country,
        p_last_message_at
    )
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$; 