// QuillQuest Frontend Application

// Tab Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update tab content
    const tabId = btn.getAttribute('data-tab');
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId!)?.classList.add('active');
  });
});

// Helper: Show loading state
function showLoading(resultId: string) {
  const resultArea = document.getElementById(resultId);
  if (resultArea) {
    resultArea.className = 'result-area visible loading';
    resultArea.innerHTML = '<div class="spinner"></div>';
  }
}

// Helper: Show error
function showError(resultId: string, message: string) {
  const resultArea = document.getElementById(resultId);
  if (resultArea) {
    resultArea.className = 'result-area visible error';
    resultArea.innerHTML = `<p>Error: ${message}</p>`;
  }
}

// Helper: API call
async function apiCall(endpoint: string, data: object) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Generate Writing Prompt
async function generatePrompt() {
  const genre = (document.getElementById('genre') as HTMLSelectElement).value;
  const resultId = 'prompt-result';

  showLoading(resultId);

  try {
    const result = await apiCall('/api/prompts', { genre });
    const resultArea = document.getElementById(resultId)!;
    resultArea.className = 'result-area visible';

    let html = `<p class="result-prompt">"${result.prompt}"</p>`;
    if (result.imageUrl) {
      html += `<img src="${result.imageUrl}" alt="Prompt inspiration" class="result-image">`;
    }
    resultArea.innerHTML = html;
  } catch (e: any) {
    showError(resultId, e.message);
  }
}

// Continue Story
async function continueStory() {
  const storyText = (document.getElementById('story-text') as HTMLTextAreaElement).value;
  const direction = (document.getElementById('story-direction') as HTMLInputElement).value;
  const resultId = 'continue-result';

  if (!storyText.trim()) {
    showError(resultId, 'Please enter your story text');
    return;
  }

  showLoading(resultId);

  try {
    const result = await apiCall('/api/stories/continue', { storyText, direction: direction || undefined });
    const resultArea = document.getElementById(resultId)!;
    resultArea.className = 'result-area visible';

    let html = `
      <div class="continuation-card">
        ${result.imageUrl ? `<img src="${result.imageUrl}" alt="Story scene" class="continuation-image">` : ''}
        <div>
          <p class="section-label">Continuation</p>
          <div class="continuation-text">${result.continuation.split('\n').map((p: string) => `<p>${p}</p>`).join('')}</div>
          ${result.suggestions?.length ? `
            <p class="section-label">Alternative Directions</p>
            <div class="suggestions-list">
              ${result.suggestions.map((s: string) => `<button class="suggestion-btn" onclick="useSuggestion('${s.replace(/'/g, "\\'")}')">${s}</button>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
    resultArea.innerHTML = html;
  } catch (e: any) {
    showError(resultId, e.message);
  }
}

// Helper to use a suggestion as direction
function useSuggestion(suggestion: string) {
  const directionInput = document.getElementById('story-direction') as HTMLInputElement;
  directionInput.value = suggestion;
  directionInput.scrollIntoView({ behavior: 'smooth' });
}

// Generate Character
async function generateCharacter() {
  const description = (document.getElementById('character-desc') as HTMLTextAreaElement).value;
  const resultId = 'character-result';

  if (!description.trim()) {
    showError(resultId, 'Please enter a character description');
    return;
  }

  showLoading(resultId);

  try {
    const result = await apiCall('/api/characters', { description });
    const resultArea = document.getElementById(resultId)!;
    resultArea.className = 'result-area visible';

    let html = `
      <div class="character-card">
        ${result.portraitUrl ? `<img src="${result.portraitUrl}" alt="${result.name}" class="portrait">` : ''}
        <div>
          <h3>${result.name}</h3>
          <p class="section-label">Backstory</p>
          <p>${result.backstory}</p>
          <p class="section-label">Appearance</p>
          <p>${result.appearance}</p>
          ${result.traits?.length ? `
            <p class="section-label">Traits</p>
            <div class="trait-list">
              ${result.traits.map((t: string) => `<span class="trait">${t}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
    resultArea.innerHTML = html;
  } catch (e: any) {
    showError(resultId, e.message);
  }
}

// Visualize Scene
async function visualizeScene() {
  const description = (document.getElementById('scene-desc') as HTMLTextAreaElement).value;
  const resultId = 'scene-result';

  if (!description.trim()) {
    showError(resultId, 'Please enter a scene description');
    return;
  }

  showLoading(resultId);

  try {
    const result = await apiCall('/api/scenes', { description });
    const resultArea = document.getElementById(resultId)!;
    resultArea.className = 'result-area visible';

    let html = `
      <div class="scene-card">
        ${result.imageUrl ? `<img src="${result.imageUrl}" alt="Scene visualization" class="visualization">` : ''}
        <div>
          <p class="section-label">Enhanced Description</p>
          <p>${result.description}</p>
        </div>
      </div>
    `;
    resultArea.innerHTML = html;
  } catch (e: any) {
    showError(resultId, e.message);
  }
}

// Generate World
async function generateWorld() {
  const concept = (document.getElementById('world-concept') as HTMLTextAreaElement).value;
  const resultId = 'world-result';

  if (!concept.trim()) {
    showError(resultId, 'Please enter a world concept');
    return;
  }

  showLoading(resultId);

  try {
    const result = await apiCall('/api/worlds', { concept });
    const resultArea = document.getElementById(resultId)!;
    resultArea.className = 'result-area visible';

    let html = `
      <div class="world-card">
        ${result.imageUrl ? `<img src="${result.imageUrl}" alt="${result.name}" class="landscape">` : ''}
        <div>
          <h3>${result.name}</h3>
          <p class="section-label">Description</p>
          <p>${result.description}</p>
          ${result.history ? `
            <p class="section-label">History</p>
            <p>${result.history}</p>
          ` : ''}
          ${result.features?.length ? `
            <p class="section-label">Notable Features</p>
            <ul class="feature-list">
              ${result.features.map((f: string) => `<li>${f}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      </div>
    `;
    resultArea.innerHTML = html;
  } catch (e: any) {
    showError(resultId, e.message);
  }
}

// Make functions globally available
(window as any).generatePrompt = generatePrompt;
(window as any).continueStory = continueStory;
(window as any).useSuggestion = useSuggestion;
(window as any).generateCharacter = generateCharacter;
(window as any).visualizeScene = visualizeScene;
(window as any).generateWorld = generateWorld;

console.log('QuillQuest loaded!');
