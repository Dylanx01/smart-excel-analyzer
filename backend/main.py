from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from io import BytesIO
import openpyxl
import os
import json
import httpx

app = FastAPI(title="Smart Excel Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

def unmerge_and_fill(file_bytes):
    wb = openpyxl.load_workbook(BytesIO(file_bytes), data_only=True)
    ws = wb.active
    merged_ranges = list(ws.merged_cells.ranges)
    for merge_range in merged_ranges:
        min_row = merge_range.min_row
        min_col = merge_range.min_col
        top_left_value = ws.cell(row=min_row, column=min_col).value
        ws.unmerge_cells(str(merge_range))
        for row in range(merge_range.min_row, merge_range.max_row + 1):
            for col in range(merge_range.min_col, merge_range.max_col + 1):
                ws.cell(row=row, column=col).value = top_left_value
    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer

def detect_header_row(df_raw):
    for i, row in df_raw.iterrows():
        non_null = row.dropna()
        if len(non_null) >= 2:
            str_count = sum(1 for v in non_null if isinstance(v, str))
            if str_count >= len(non_null) * 0.5:
                return i
    return 0

def clean_dataframe(df):
    df = df.dropna(how='all')
    df = df.dropna(axis=1, how='all')
    new_cols = []
    seen = {}
    for col in df.columns:
        col_str = str(col).strip()
        if col_str.startswith('Unnamed') or col_str == 'nan':
            col_str = f'Colonne_{len(new_cols)+1}'
        if col_str in seen:
            seen[col_str] += 1
            col_str = f'{col_str}_{seen[col_str]}'
        else:
            seen[col_str] = 0
        new_cols.append(col_str)
    df.columns = new_cols
    for col in df.columns:
        if df[col].dtype == object:
            df[col] = df[col].ffill()
    for col in df.columns:
        if df[col].dtype == object:
            mask = df[col].astype(str).str.lower().str.contains(
                r'^(total|sous.total|somme|sum|grand total)$',
                regex=True, na=False
            )
            df = df[~mask]
    df = df.reset_index(drop=True)
    return df

def smart_read_excel(file_bytes):
    try:
        cleaned_buffer = unmerge_and_fill(file_bytes)
    except Exception:
        cleaned_buffer = BytesIO(file_bytes)

    try:
        df_raw = pd.read_excel(cleaned_buffer, header=None)
    except Exception:
        df_raw = pd.read_excel(BytesIO(file_bytes), header=None)

    header_row = detect_header_row(df_raw)

    cleaned_buffer.seek(0)
    try:
        df = pd.read_excel(cleaned_buffer, header=header_row)
    except Exception:
        df = pd.read_excel(BytesIO(file_bytes), header=header_row)

    df = clean_dataframe(df)

    for col in df.columns:
        try:
            converted = pd.to_numeric(
                df[col].astype(str).str.replace(' ', '').str.replace(',', '.'),
                errors='coerce'
            )
            if converted.notna().sum() > len(df) * 0.5:
                df[col] = converted
        except Exception:
            pass

    for col in df.columns:
        if df[col].dtype == object:
            try:
                converted = pd.to_datetime(df[col], infer_datetime_format=True, errors='coerce')
                if converted.notna().sum() > len(df) * 0.5:
                    df[col] = converted
            except Exception:
                pass

    return df

async def generate_gemini_insights(df, result):
    """Génère des insights intelligents avec Gemini"""
    try:
        # Préparer le contexte pour Gemini
        context = {
            "nombre_lignes": result["summary"]["total_rows"],
            "nombre_colonnes": result["summary"]["total_columns"],
            "valeurs_manquantes": result["summary"]["missing_values"],
            "colonnes": result["summary"]["columns_list"],
            "kpis": result["kpis"],
            "alertes": result["alerts"],
            "anomalies": result["anomalies"],
            "apercu_donnees": df.head(10).to_string()
        }

        prompt = f"""Tu es un expert analyste de données pour PME africaines.
Analyse ces données Excel et génère des insights intelligents, concrets et actionnables.

DONNÉES :
{json.dumps(context, ensure_ascii=False, default=str)}

INSTRUCTIONS :
1. Identifie le contexte/domaine des données (sport, RH, finance, comptabilité, etc.)
2. Génère exactement 5 insights intelligents et spécifiques aux données
3. Pour chaque insight, donne un conseil concret et actionnable
4. Identifie les points forts et les points faibles
5. Génère un plan d'action prioritaire avec 3 actions concrètes
6. Donne un score de santé global entre 0 et 100

Réponds UNIQUEMENT en JSON avec cette structure exacte :
{{
  "domaine": "string (ex: Comptabilité sportive, Gestion RH, Finance...)",
  "resume_executif": "string (2-3 phrases résumant la situation globale)",
  "insights": [
    {{
      "titre": "string",
      "observation": "string",
      "conseil": "string",
      "priorite": "haute|moyenne|faible",
      "icone": "emoji"
    }}
  ],
  "points_forts": ["string", "string", "string"],
  "points_faibles": ["string", "string", "string"],
  "plan_action": [
    {{
      "priorite": 1,
      "action": "string",
      "delai": "string",
      "impact": "string"
    }}
  ],
  "score_sante": number
}}"""

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                GEMINI_URL,
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.3,
                        "maxOutputTokens": 2048
                    }
                }
            )
            data = response.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]

            # Nettoyer le JSON
            text = text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

            return json.loads(text)

    except Exception as e:
        return {
            "domaine": "Données générales",
            "resume_executif": "Analyse effectuée avec succès.",
            "insights": [],
            "points_forts": [],
            "points_faibles": [],
            "plan_action": [],
            "score_sante": 75
        }

def analyze_excel(df):
    result = {
        "summary": {},
        "columns": {},
        "kpis": [],
        "charts": [],
        "alerts": [],
        "anomalies": []
    }

    result["summary"] = {
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "missing_values": int(df.isnull().sum().sum()),
        "columns_list": list(df.columns)
    }

    date_cols = []
    number_cols = []
    category_cols = []
    boolean_cols = []

    for col in df.columns:
        series = df[col]

        if pd.api.types.is_datetime64_any_dtype(series):
            date_cols.append(col)
            result["columns"][col] = "date"
            continue

        unique_lower = series.dropna().astype(str).str.lower().unique()
        bool_keywords = {"oui","non","yes","no","true","false","présent","absent","actif","inactif"}
        if set(unique_lower).issubset(bool_keywords):
            boolean_cols.append(col)
            result["columns"][col] = "boolean"
            continue

        if pd.api.types.is_numeric_dtype(series):
            number_cols.append(col)
            result["columns"][col] = "number"
            continue

        category_cols.append(col)
        result["columns"][col] = "category"

    for col in number_cols:
        clean = df[col].dropna()
        if len(clean) == 0:
            continue
        result["kpis"].append({
            "column": col,
            "total": round(float(clean.sum()), 2),
            "average": round(float(clean.mean()), 2),
            "min": round(float(clean.min()), 2),
            "max": round(float(clean.max()), 2),
            "count": int(clean.count())
        })

        if clean.max() > clean.mean() * 3:
            result["alerts"].append({
                "type": "warning",
                "message": f"Valeur anormalement élevée dans '{col}': {round(float(clean.max()), 2)}"
            })

    for date_col in date_cols:
        for num_col in number_cols:
            try:
                time_series = df.groupby(df[date_col].dt.to_period("M"))[num_col].sum()
                values = [round(float(v), 2) for v in time_series.values]
                labels = [str(p) for p in time_series.index]

                if len(values) >= 2 and values[-1] < values[-2] * 0.8:
                    result["alerts"].append({
                        "type": "danger",
                        "message": f"Baisse de plus de 20% sur '{num_col}'"
                    })

                result["charts"].append({
                    "type": "line",
                    "title": f"Évolution de {num_col} par mois",
                    "labels": labels,
                    "values": values,
                    "x_col": date_col,
                    "y_col": num_col
                })
            except Exception:
                pass

    for cat_col in category_cols:
        for num_col in number_cols:
            try:
                grouped = df.groupby(cat_col)[num_col].sum().sort_values(ascending=False).head(10)
                if len(grouped) > 0:
                    result["charts"].append({
                        "type": "bar",
                        "title": f"{num_col} par {cat_col}",
                        "labels": [str(l) for l in grouped.index.tolist()],
                        "values": [round(float(v), 2) for v in grouped.values.tolist()],
                        "x_col": cat_col,
                        "y_col": num_col
                    })
            except Exception:
                pass

    for bool_col in boolean_cols:
        try:
            counts = df[bool_col].astype(str).str.lower().value_counts()
            result["charts"].append({
                "type": "donut",
                "title": f"Répartition de {bool_col}",
                "labels": counts.index.tolist(),
                "values": [int(v) for v in counts.values.tolist()]
            })
        except Exception:
            pass

    for col in number_cols:
        try:
            clean = df[col].dropna()
            if len(clean) < 3:
                continue
            mean = clean.mean()
            std = clean.std()
            if std == 0:
                continue
            outliers = df[abs(df[col] - mean) > 3 * std]
            if not outliers.empty:
                result["anomalies"].append({
                    "column": col,
                    "count": len(outliers),
                    "message": f"{len(outliers)} valeur(s) aberrante(s) dans '{col}'"
                })
        except Exception:
            pass

    return result

@app.get("/")
def root():
    return {"message": "Smart Excel Analyzer API is running 🚀"}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = smart_read_excel(contents)
        result = analyze_excel(df)

        # Générer les insights Gemini
        gemini_insights = await generate_gemini_insights(df, result)
        result["ai_insights"] = gemini_insights

        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}
