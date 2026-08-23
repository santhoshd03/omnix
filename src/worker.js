export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (
      url.pathname === "/api/chat" &&
      request.method === "POST"
    ) {
      try {
        const body = await request.json();
        const message = body.message;

        if (!message || typeof message !== "string") {
          return Response.json(
            { error: "Message is required." },
            { status: 400 }
          );
        }

        const apiKey = env.GEMINI_API_KEY;

        console.log(
          "Gemini key exists:",
          Boolean(apiKey)
        );

        if (!apiKey) {
          return Response.json(
            {
              error:
                "Gemini API key is not configured."
            },
            { status: 500 }
          );
        }

        const model = "gemini-2.5-flash";

        const geminiUrl =
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(
          geminiUrl,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              systemInstruction: {
                parts: [
                  {
                    text:
                      "You are Omnix, a helpful AI assistant. " +
                      "Answer clearly and naturally."
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
          }
        );

        const data =
          await response.json();

        console.log(
          "Gemini status:",
          response.status
        );

        if (!response.ok) {
          return Response.json(
            {
              error:
                data?.error?.message ||
                "Gemini request failed."
            },
            { status: 500 }
          );
        }

        const reply =
          data?.candidates?.[0]
            ?.content?.parts?.[0]?.text;

        if (!reply) {
          return Response.json(
            {
              error:
                "Gemini returned no answer."
            },
            { status: 500 }
          );
        }

        return Response.json({
          reply
        });

      } catch (error) {

        console.error(
          "Worker error:",
          error
        );

        return Response.json(
          {
            error:
              error?.message ||
              "Internal server error."
          },
          { status: 500 }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
