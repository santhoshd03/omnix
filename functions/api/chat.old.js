export async function onRequestPost(context) {

    try {

        const body = await context.request.json();

        const message = body.message;

        if (!message || typeof message !== "string") {

            return Response.json(
                { error: "Message is required." },
                { status: 400 }
            );
        }

        const apiKey = context.env.GEMINI_API_KEY;

        if (!apiKey) {

            return Response.json(
                { error: "Gemini API key is not configured." },
                { status: 500 }
            );
        }

        const model = "gemini-2.5-flash";

        const url =
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const geminiResponse = await fetch(url, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                systemInstruction: {
                    parts: [{
                        text:
                            "You are Omnix, a helpful AI assistant. " +
                            "Answer clearly and naturally. " +
                            "Keep answers appropriate for a general audience."
                    }]
                },

                contents: [{
                    role: "user",
                    parts: [{
                        text: message
                    }]
                }]

            })

        });

        const data = await geminiResponse.json();

        if (!geminiResponse.ok) {

            console.error("Gemini error:", data);

            return Response.json(
                {
                    error:
                        data.error?.message ||
                        "Gemini request failed."
                },
                { status: 500 }
            );
        }

        const reply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!reply) {

            return Response.json(
                { error: "Gemini returned no answer." },
                { status: 500 }
            );
        }

        return Response.json({
            reply: reply
        });

    } catch (error) {

        console.error("Worker error:", error);

        return Response.json(
            {
                error: "Internal server error."
            },
            { status: 500 }
        );
    }
                      }
