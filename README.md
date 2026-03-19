# Stoxify 
## Behavioural & Preferential Stock Recommendation Engine
A full-stack, behavior-driven stock recommendation platform that learns user preferences and ranks equities using a multi-factor quantitative model.

## Overview
Stoxify is an intelligent stock recommendation system that combines:
- Behavioral learning from user actions
- Quantitative financial modeling
- Hybrid scoring and portfolio optimization
Unlike traditional platforms, Stoxify adapts dynamically to user preferences without requiring explicit questionnaires.

## Tech Stack
### Frontend
- React
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Quant Engine
- Python
- Pandas, NumPy
- Custom scoring & normalization pipelines

### Core Features
Behavioral & Preferential Inference Engine
Stoxify builds a data-driven investor profile by learning from user-selected stocks.

*Behavioral Inference*  
Analyzes user actions (selected stocks) to extract investment patterns.
Process:  
- Extracts key metrics from selected stocks:
  - CAGR (growth)
  - Volatility (risk)
  - Skewness (return asymmetry)
  - Alpha (market outperformance)
  - Recovery (crash resilience)

Output:
- Aggregated Behavior Vector (B)
- Captures tendencies like:
- Growth-focused vs defensive
- Risk-seeking vs risk-averse

*Preferential Inference*  
Transforms behavioral signals into explicit investment preferences.
Infers:
- Risk appetite (Aggressive / Moderate / Conservative)
- Growth vs stability bias
- Drawdown tolerance
- Recovery sensitivity

Example Mapping:
- High CAGR + High Skewness → Growth investor
- Low Volatility + High Recovery → Defensive investor

### End-to-End Flow
```
User Selected Stocks
        ↓
Behavioral Feature Extraction
        ↓
Behavior Vector (B)
        ↓
Preference Inference
        ↓
Dynamic Weight Adjustment
        ↓
Final Recommendations
```
2. Multi-Factor Quantitative Model
Each stock is evaluated using 5 normalized factors:

| Metric | Role |
| --- | --- |
| CAGR | Growth potential |
| Volatility | Risk (inverted) |  
| Skewness	| Upside bias |
|Alpha	Market | outperformance |
|Recovery	 | Drawdown resilience |

3. Scoring Formula

*Score = CAGR×w1​+(1−Volatility)×w2​+Skewness×w3​+Alpha×w4​+Recovery×w5*​​


4. Normalization

*norm = min(max(norm,0),1)*

Ensures all metrics are:
- Comparable
- Bounded
- Stable across datasets

5. Hybrid Weighting System
Final ranking combines:

*W = 0.4×Behavior+0.6×Performance*

- Behavior (B): User-driven preferences
- Performance (P): Quantitative score

6. Stock Universe
- 145+ global equities
- Multi-sector coverage
- Scalable dataset design

7. Portfolio Generation
- Ranked stock recommendations
- Optimized allocations
- Risk-aware suggestions

### Architecture
```
Frontend (React)
        ↓
Backend API (Express)
        ↓
Quant Engine (Python)
        ↓
Scoring + Ranking
        ↓
Portfolio Output
```

### Project Structure
```
Stoxify/
│
├── frontend/              # React UI
│   ├── components/
│   ├── pages/
│   └── services/
│
├── backend/               # Express server
│   ├── routes/
│   ├── controllers/
│   └── models/
│
├── quant-engine/          # Python analytics
│   ├── metrics/
│   ├── normalization/
│   └── scoring/
│
├── data/                  # Stock datasets
├── utils/                 # Shared utilities
└── README.md
```

### Getting Started
1. Clone the Repository
```
git clone https://github.com/SanjeevRK21/Stoxify.git
cd stoxify
```
2. Setup Frontend
```
cd frontend
npm install
npm run dev
```
3. Setup Backend
```
cd backend
npm install
npm start
```
4. Run Quant Engine
```
cd quant-engine
python main.py
```

### Example Workflow
- User selects preferred stocks
- Behavioral profile is constructed
- Quant engine evaluates all stocks
- Scores are normalized and weighted
- Final ranking + portfolio generated

### Key Highlights
- Behavior-driven recommendations
- Multi-factor quantitative scoring
- Hybrid weighting model
- Adaptive preference learning
- Modular full-stack architecture

### Future Enhancements
- Real-time market data integration
- AI/LLM-based financial insights
- Portfolio backtesting engine
- Risk metrics (Sharpe, Sortino)
- Cloud deployment (AWS/GCP)

### Contributing
Contributions are welcome!
Feel free to fork the repo and submit a PR.

### License
This project is licensed under the MIT License.

### Author
Sanjeev Raj 
