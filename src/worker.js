export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ================================
    // OMNIX AI CHAT API
    // ================================
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const body = await request.json();
        const message = body.message;

        // Validate message
        if (!message || typeof message !== "string") {
          return Response.json(
            {
              error: "Message is required."
            },
            {
              status: 400
            }
          );
        }

        // Get Gemini API key
        const apiKey = env.GEMINI_API_KEY;

        if (!apiKey) {
          return Response.json(
            {
              error: "Gemini API key is not configured."
            },
            {
              status: 500
            }
          );
        }

        // Gemini model
        const model = "gemini-2.5-flash";

        const geminiUrl =
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        // Send request to Gemini
        const response = await fetch(geminiUrl, {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text:
                    "You are Omnix, a helpful AI assistant. " +
                    "Answer clearly, naturally and helpfully. " +
                    "Keep answers appropriate for a general audience."
                }
              ]
            },

            contents: [
              {
                role: "user",

                parts: [
                  {
                    text: message
                  }
                ]
              }
            ]
          })
        });

        const data = await response.json();

        // Handle Gemini errors
        if (!response.ok) {
          console.error("Gemini error:", data);

          return Response.json(
            {
              error:
                data?.error?.message ||
                "Gemini request failed."
            },
            {
              status: 500
            }
          );
        }

        // Get AI response
        const reply =
          data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!reply) {
          return Response.json(
            {
              error: "Gemini returned no answer."
            },
            {
              status: 500
            }
          );
        }

        // Send response to frontend
        return Response.json({
          reply: reply
        });

      } catch (error) {
        console.error("Worker error:", error);

        return Response.json(
          {
            error: "Internal server error."
          },
          {
            status: 500
          }
        );
      }
    }

    // ================================
    // SERVE OMNIX FRONTEND
    // ================================
    return env.ASSETS.fetch(request);
  }
};
