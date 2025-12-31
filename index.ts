// QuillQuest - AI-Powered Creative Writing Companion
import { VeniceService } from "./src/services/venice";
import index from "./public/index.html";

const PORT = parseInt(process.env.PORT || "3000");
const venice = new VeniceService(process.env.VENICE_API_KEY || "");

// Helper to parse JSON body
async function parseBody(req: Request) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

// JSON response helper
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Error response helper
function error(message: string, status = 400) {
  return json({ error: message }, status);
}

const server = Bun.serve({
  port: PORT,
  routes: {
    // Landing page
    "/": index,

    // API: Generate writing prompts
    "/api/prompts": {
      POST: async (req) => {
        try {
          const body = await parseBody(req);
          const result = await venice.generateWritingPrompt(body.genre);
          return json(result);
        } catch (e) {
          console.error("Error generating prompt:", e);
          return error("Failed to generate writing prompt", 500);
        }
      },
    },

    // API: Generate character profiles
    "/api/characters": {
      POST: async (req) => {
        try {
          const body = await parseBody(req);
          if (!body.description) {
            return error("Description is required");
          }
          const result = await venice.generateCharacter(body.description);
          return json(result);
        } catch (e) {
          console.error("Error generating character:", e);
          return error("Failed to generate character", 500);
        }
      },
    },

    // API: Visualize scenes
    "/api/scenes": {
      POST: async (req) => {
        try {
          const body = await parseBody(req);
          if (!body.description) {
            return error("Scene description is required");
          }
          const result = await venice.visualizeScene(body.description);
          return json(result);
        } catch (e) {
          console.error("Error visualizing scene:", e);
          return error("Failed to visualize scene", 500);
        }
      },
    },

    // API: Generate worlds/settings
    "/api/worlds": {
      POST: async (req) => {
        try {
          const body = await parseBody(req);
          if (!body.concept) {
            return error("World concept is required");
          }
          const result = await venice.generateWorld(body.concept);
          return json(result);
        } catch (e) {
          console.error("Error generating world:", e);
          return error("Failed to generate world", 500);
        }
      },
    },

    // API: Continue story
    "/api/stories/continue": {
      POST: async (req) => {
        try {
          const body = await parseBody(req);
          if (!body.storyText) {
            return error("Story text is required");
          }
          const result = await venice.continueStory(body.storyText, body.direction);
          return json(result);
        } catch (e) {
          console.error("Error continuing story:", e);
          return error("Failed to continue story", 500);
        }
      },
    },

    // Health check
    "/api/health": {
      GET: () => json({ status: "ok", timestamp: new Date().toISOString() }),
    },
  },

  // Handle 404
  fetch(req) {
    return new Response("Not Found", { status: 404 });
  },

  development: {
    hmr: true,
    console: true,
  },
});

console.log(`
╔═══════════════════════════════════════════╗
║         QuillQuest Server Started         ║
╠═══════════════════════════════════════════╣
║  Local:   http://localhost:${PORT}            ║
║  Press Ctrl+C to stop                     ║
╚═══════════════════════════════════════════╝
`);
