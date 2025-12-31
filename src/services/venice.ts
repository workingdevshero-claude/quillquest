// Venice.ai API Service for QuillQuest

const VENICE_API_URL = "https://api.venice.ai";

interface ImageGenerationOptions {
  prompt: string;
  style?: string;
  width?: number;
  height?: number;
}

interface TextGenerationOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export class VeniceService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${VENICE_API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Venice API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async generateImage(options: ImageGenerationOptions): Promise<string> {
    const { prompt, style = "realistic", width = 1024, height = 1024 } = options;

    const response = await this.request("/api/v1/image/generate", {
      method: "POST",
      body: JSON.stringify({
        prompt,
        style_preset: style,
        width,
        height,
        model: "fluently-xl",
      }),
    });

    // Return the image URL or base64 data
    return response.images?.[0]?.url || response.images?.[0]?.b64_json;
  }

  async generateText(options: TextGenerationOptions): Promise<string> {
    const { prompt, maxTokens = 500, temperature = 0.8 } = options;

    const response = await this.request("/api/v1/chat/completions", {
      method: "POST",
      body: JSON.stringify({
        model: "llama-3.3-70b",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: maxTokens,
        temperature,
      }),
    });

    return response.choices?.[0]?.message?.content || "";
  }

  async generateWritingPrompt(genre?: string): Promise<{ prompt: string; imageUrl?: string }> {
    const genreText = genre ? `in the ${genre} genre` : "";

    const textPrompt = `Generate a creative and engaging writing prompt ${genreText}.
    The prompt should be specific enough to inspire a story but open-ended enough for creative interpretation.
    Format: Just the prompt text, no explanations or additional text.`;

    const promptText = await this.generateText({ prompt: textPrompt });

    // Generate an inspiring image to go with the prompt
    const imagePrompt = `Atmospheric concept art for a story: ${promptText.slice(0, 200)}. Cinematic, dramatic lighting, high quality illustration`;

    try {
      const imageUrl = await this.generateImage({ prompt: imagePrompt });
      return { prompt: promptText, imageUrl };
    } catch {
      return { prompt: promptText };
    }
  }

  async generateCharacter(description: string): Promise<{
    name: string;
    backstory: string;
    traits: string[];
    appearance: string;
    portraitUrl?: string;
  }> {
    const textPrompt = `Create a detailed character profile based on this description: "${description}"

    Respond in JSON format:
    {
      "name": "character name",
      "backstory": "2-3 sentences about their history",
      "traits": ["trait1", "trait2", "trait3"],
      "appearance": "detailed physical description"
    }`;

    const response = await this.generateText({ prompt: textPrompt, maxTokens: 800 });

    let character;
    try {
      // Try to parse JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      character = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        name: "Unknown",
        backstory: response,
        traits: [],
        appearance: description
      };
    } catch {
      character = {
        name: "Unknown",
        backstory: response,
        traits: [],
        appearance: description
      };
    }

    // Generate character portrait
    const portraitPrompt = `Professional character portrait, ${character.appearance}. High quality, detailed, fantasy art style, dramatic lighting`;

    try {
      character.portraitUrl = await this.generateImage({
        prompt: portraitPrompt,
        width: 512,
        height: 512
      });
    } catch {
      // Portrait generation failed, continue without it
    }

    return character;
  }

  async visualizeScene(sceneDescription: string): Promise<{
    description: string;
    imageUrl?: string;
  }> {
    // Enhance the scene description
    const enhancedPrompt = `Take this scene description and make it more vivid and atmospheric: "${sceneDescription}"

    Provide a single paragraph that brings the scene to life with sensory details.`;

    const enhancedDescription = await this.generateText({ prompt: enhancedPrompt });

    // Generate scene visualization
    const imagePrompt = `Cinematic scene illustration: ${sceneDescription}. Dramatic composition, atmospheric lighting, high quality concept art, detailed environment`;

    try {
      const imageUrl = await this.generateImage({ prompt: imagePrompt });
      return { description: enhancedDescription, imageUrl };
    } catch {
      return { description: enhancedDescription };
    }
  }

  async generateWorld(concept: string): Promise<{
    name: string;
    description: string;
    history: string;
    features: string[];
    imageUrl?: string;
  }> {
    const textPrompt = `Create a fictional world/setting based on this concept: "${concept}"

    Respond in JSON format:
    {
      "name": "world/setting name",
      "description": "2-3 sentences describing the setting",
      "history": "brief history of this place",
      "features": ["notable feature 1", "notable feature 2", "notable feature 3"]
    }`;

    const response = await this.generateText({ prompt: textPrompt, maxTokens: 800 });

    let world;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      world = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        name: "Unknown Realm",
        description: response,
        history: "",
        features: []
      };
    } catch {
      world = {
        name: "Unknown Realm",
        description: response,
        history: "",
        features: []
      };
    }

    // Generate world visualization
    const imagePrompt = `Epic landscape concept art: ${world.description}. Sweeping vista, dramatic skies, detailed environment art, cinematic lighting`;

    try {
      world.imageUrl = await this.generateImage({ prompt: imagePrompt });
    } catch {
      // Image generation failed, continue without it
    }

    return world;
  }
}

// Create singleton instance
export const venice = new VeniceService(process.env.VENICE_API_KEY || "");
