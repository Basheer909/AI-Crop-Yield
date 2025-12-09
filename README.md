# 🌾 AI-Based Crop Yield Prediction & Optimization Platform

This project is a **full-stack ML-powered system** designed to help farmers predict crop yields in real time and receive data-driven optimization recommendations using Indian agricultural data.
It includes a modern UI, ML inference engine, district-specific adjustments, and optional integration with live weather APIs.

---

## 🚀 Project Overview

The platform provides:

* 🔐 **User Authentication** (Register/Login)
* 📍 **Farm Management** (save district, crop, season, etc.)
* 🤖 **ML-Based Yield Prediction** using Multiple Linear Regression
  (with crop-specific coefficients and district factors)
* 🌦️ **Optional Live Weather Integration**
* 📈 **Model Confidence & Factor Contributions**
* 🌱 **Optimization Recommendation** (suggest better alternative crops)
* 📊 **Data Visualizations** (impact charts, trend lines, crop comparison)

This project supports Indian crops like Rice, Wheat, Jowar, Arhar/Tur, Bajra, Maize, Groundnut, Soybeans, etc.

---

## 🏗️ Tech Stack

### **Frontend**

* React + TypeScript
* Vite
* shadcn-ui
* Tailwind CSS

### **Backend / ML**

* Serverless Edge Function (TypeScript)
* Multiple Linear Regression (hand-engineered coefficients)
* Seasonal weather averages
* District-level adjustment factors

---

## 📂 Project Structure

```
project-root/
├── src/
│   ├── components/       # UI components
│   ├── lib/              # predictionService & helpers
│   ├── pages/            # main screens
│   └── styles/
├── edge-functions/
│   └── predictYield.ts   # ML inference engine
├── public/
├── package.json
└── README.md
```

---

## ⚙️ Installation & Setup

Before running the project, ensure you have **Node.js** and **npm** installed.

### **1. Clone the repository**

```sh
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_PROJECT_NAME>
```

### **2. Install dependencies**

```sh
npm install
```

### **3. Start the development server**

```sh
npm run dev
```

### **4. Edit the project**

You can now open the folder in your preferred editor (VS Code recommended):

```sh
code .
```

---

## 🌤️ Live Weather Integration (Optional)

To enable live weather predictions, add your **OpenWeatherMap API key** inside your environment configuration:

```
OPENWEATHER_KEY=your_api_key
```

If omitted, the model will fall back to **India's seasonal average climate data**.

---

## 🤖 ML Model Logic (Summary)

The ML model uses:

### **1. Crop-level coefficients**

Each crop has its own regression parameters:

* intercept
* rainfall coefficient
* temperature coefficient
* pesticides coefficient
* baseline yield & standard deviation

### **2. Seasonal climate baselines**

* Kharif
* Rabi
* Autumn
* Whole Year

### **3. District adjustment factors (Karnataka)**

Example:

```
Chikkamagaluru → ×1.25  
Tumkur → ×1.05  
Raichur → ×0.95  
```

### **4. Confidence estimation**

Based on deviation from expected rainfall and temperature.

### **5. Alternative Crop Recommendation**

The system evaluates other crops and recommends one with significantly higher potential yield.

---

## 🧪 Prediction Flow

1. User selects:

   * State
   * District
   * Crop
   * Season
   * (Optional) Live weather

2. System computes:

   * ML regression yield
   * District factor adjustment
   * Seasonal climate adjustments
   * Confidence score

3. Optimization algorithm:

   * Compares all crop yields
   * Recommends best alternative crop

4. UI displays:

   * Final predicted yield
   * Confidence %
   * Factor impact breakdown
   * Recommendation & expected gain

---

## 📦 Deployment

You can deploy this project to platforms like:

* **Vercel**
* **Netlify**
* **Cloudflare Pages**
* **Render**
* **AWS Amplify**

To deploy:

```
npm run build
```

Then upload the `dist/` folder or connect your GitHub repository.

---

## 🔧 Customization

You can freely customize:

* Crop coefficients
* District multipliers
* Seasonal datasets
* Weather API sources
* UI theme & layout
* Charts & analytics


## 🙌 Acknowledgements

The ML model is based on:

* FAO/World Bank agricultural datasets
* Indian district-level crop statistics
* Seasonal climate patterns


