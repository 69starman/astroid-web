# Agent Configuration Panel Implementation

## Overview

This implementation delivers the AI agent configuration wizard as described in issue #38. The solution comprises two core files:

1. **`src/features/agents/components/AgentConfigPanel.tsx`** — The main configuration component
2. **`src/features/agents/systemPromptTemplates.ts`** — System prompt template data and utilities

## Features

### ✓ Dynamic Model Selection
- Provider dropdown updates available models immediately when changed
- Other form fields (temperature, maxTokens, systemPrompt) are preserved—only the model field resets to the default for the new provider
- Supports: OpenAI, Anthropic, Gemini, Nvidia, Ollama, Custom

### ✓ Behavior Settings with Sliders
- **Temperature**: Interactive range slider (0–2) with visual gradient from "Precise" to "Creative"
- **Max Tokens**: Number input with sensible defaults and validation (minimum 1 token)
- Real-time validation prevents invalid states

### ✓ System Prompt Templates
- Dropdown with 6 preconfigured templates:
  - Risk Analyst (Analysis)
  - High Frequency Arbitrageur (Trading)
  - Conservative Auditor (Compliance)
  - Yield Optimizer (DeFi)
  - Treasury Manager (Treasury)
  - Payment Processor (Payments)
- Template selection auto-populates the system prompt field
- Users can customize or override the template text after selection
- Copy-to-clipboard button for easy sharing

### ✓ Zod Validation
- Temperature: Must be between 0 and 2 (inclusive)
- Max Tokens: Must be at least 1
- Model: Required field
- System Prompt: Required field, minimum 1 character
- All validations provide clear, user-facing error messages

### ✓ Accessibility
- Full keyboard navigation support
- Proper label-input associations using `htmlFor` and generated IDs
- ARIA attributes for range slider (`aria-valuemin`, `aria-valuemax`, `aria-valuenow`)
- Error messages marked with `role="alert"`
- Semantic HTML with fieldsets and legends for grouped settings

## File Structure

```
src/features/agents/
├── components/
│   ├── AgentConfigPanel.tsx          [NEW] Main configuration component
│   ├── AgentProviderConfigForm.tsx   [existing]
│   ├── AgentTemplateWizard.tsx       [existing]
│   └── AgentTimeline.tsx             [existing]
├── systemPromptTemplates.ts          [NEW] Template data & utilities
├── providerConfigSchema.ts           [existing]
├── schema.ts                         [existing]
├── templates.ts                      [existing]
├── templateWizardSchema.ts           [existing]
├── AgentWizard.tsx                   [existing]
└── index.ts                          [UPDATED] Added export for AgentConfigPanel
```

## Component API

### `AgentConfigPanel`

```tsx
interface AgentConfigPanelProps {
  defaultValues?: Partial<AgentConfigPanelValues>;
  onSubmit?: (values: AgentConfigPanelValues) => void | Promise<void>;
  className?: string;
}
```

**Example Usage:**

```tsx
import { AgentConfigPanel } from '@/features/agents';

export function ConfigureAgentPage() {
  const handleSubmit = async (config) => {
    // Save config to backend
    await saveAgentConfig(config);
  };

  return (
    <AgentConfigPanel
      defaultValues={{
        provider: 'anthropic',
        temperature: 0.7,
      }}
      onSubmit={handleSubmit}
    />
  );
}
```

### `systemPromptTemplates.ts` Exports

```tsx
// Array of all templates
export const SYSTEM_PROMPT_TEMPLATES: SystemPromptTemplate[];

// Get a single template by ID
export function getSystemPromptTemplateById(id: string): SystemPromptTemplate | undefined;

// Get templates filtered by category
export function getSystemPromptTemplatesByCategory(category: string): SystemPromptTemplate[];

// Get all unique categories
export function getSystemPromptCategories(): string[];
```

## Design Decisions

1. **Minimal State Management**: Uses React Hook Form for form state, avoiding unnecessary renders when unrelated fields change.

2. **Provider-Aware Model Dropdown**: The model field intelligently switches between dropdown (for providers with preset models) and text input (for Ollama/Custom providers that allow free-text model names).

3. **Template Soft Integration**: Templates auto-populate but don't lock the system prompt field—users can edit after selection without friction.

4. **Token Validation**: Set minimum to 1 rather than 0 to prevent invalid configs. Step size is 256 for convenient scrolling.

5. **Styling Alignment**: Uses existing design tokens from `src/styles/tokens.css`:
   - Gold accent for primary actions
   - Border colors from token system
   - Responsive layout with Tailwind utilities

## Validation Rules

All input validation is handled by Zod schema:

```typescript
const agentConfigPanelSchema = z.object({
  provider: z.enum(agentProviderTypes),                    // Required enum
  model: z.string().min(1, 'Model is required.'),          // Required, min 1 char
  temperature: z.coerce.number().min(0).max(2),            // Range [0, 2]
  maxTokens: z.coerce.number().min(1),                     // At least 1
  systemPrompt: z.string().min(1),                         // Required, min 1 char
  systemPromptTemplate: z.string().optional().or(z.literal('')),
});
```

Error messages are displayed inline below each field with red styling.

## Testing Recommendations

1. **Selector Changes**: Verify that changing provider resets only the model, not temperature or system prompt
2. **Temperature Bounds**: Test edge cases: 0, 0.5, 1.5, 2, and invalid (should fail on >2 or <0)
3. **Template Loading**: Confirm all 6 templates populate the correct prompt text
4. **Keyboard Navigation**: Tab through all fields, interact with sliders and dropdowns keyboard-only
5. **Validation**: Try submitting empty/invalid configs to verify error states
6. **Custom Providers**: Switch to Ollama/Custom to verify model field becomes text input

## Integration Points

- **Components/UI**: Uses existing Button, Card, FormField, Input, Select, Textarea from `@/components/ui/`
- **Schema**: Imports provider types from `providerConfigSchema.ts`
- **Toast Notifications**: Uses `sonner` for user feedback
- **Icons**: Uses `lucide-react` for visual elements

## Browser Compatibility

- Range slider (`<input type="range">`) supported in all modern browsers
- HTML5 form validation attributes (min, max, step) supported in all modern browsers
- CSS custom properties for styling supported in all modern browsers
- Accessible to screen readers via ARIA attributes
