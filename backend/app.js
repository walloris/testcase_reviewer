import express from 'express';
import cors from 'cors';
import { reviewTestCaseByGigachat, loadPromptTemplate, getRulesAndRecommendations } from './gigachat.js';

const app = express();
app.use(cors());
app.use(express.json());

function formatPrompt(template, data) {
  return template.replace(/\{(\w+)\}/g, (_, key) => data[key] ?? '');
}

app.post('/api/review', async (req, res) => {
  const { token = '', test_case = {} } = req.body;
  const rules = getRulesAndRecommendations();
  const promptTemplate = loadPromptTemplate();
  const prompt = formatPrompt(promptTemplate, {
    rules: rules.rules,
    recomendations: rules.recommendations,
    ...test_case,
  });

  const result = await reviewTestCaseByGigachat(prompt, token);
  res.json(result || { error: 'Gigachat call failed' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
