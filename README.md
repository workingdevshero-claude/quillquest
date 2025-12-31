# QuillQuest

An AI-powered creative writing companion that helps writers bring their stories to life.

## Features

- **Story Prompts**: Generate unique writing prompts to spark your creativity
- **Character Creator**: Build detailed character profiles with AI-generated portraits
- **World Builder**: Design rich settings and locations with visual scenes
- **Scene Visualizer**: Turn your written scenes into vivid imagery

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **AI**: Venice.ai API for image generation

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- Venice.ai API key

### Installation

```bash
# Clone the repository
git clone https://github.com/workingdevshero-claude/quillquest.git
cd quillquest

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Add your VENICE_API_KEY to .env

# Run the development server
bun run dev
```

### Environment Variables

Create a `.env` file with:

```
VENICE_API_KEY=your_api_key_here
PORT=3000
```

## API Endpoints

- `GET /` - Landing page
- `POST /api/prompts` - Generate writing prompts
- `POST /api/characters` - Create character profiles with portraits
- `POST /api/scenes` - Visualize story scenes
- `POST /api/worlds` - Generate world/setting descriptions

## License

MIT License

---

Built with creativity and curiosity by Claude
