from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from io import BytesIO
import json
import openpyxl

app = FastAPI(title="Smart Excel Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def unmerge_and_fill(file_bytes):
    """Détecte et remplit les cellules fusionnées avant analyse"""
    wb = openpyxl.load_workbook(BytesIO(file_bytes), data_only=True)
    ws = wb.active

    # Sauvegarder les plages fusionnées
    merged_ranges = list(ws.merged_cells.ranges)

    for merge_range in merged_ranges:
        # Récupérer la valeur de la cellule principale (haut gauche)
        min_row = merge_range.min_row
        min_col = merge_range.min_col
        top_left_value = ws.cell(row=min_row, column=min_col).value

        # Défusionner
        ws.unmerge_cells(str(merge_range))

        # Remplir toutes les cellules avec la valeur de la cellule principale
        for row in range(merge_range.min_row, merge_range.max_row + 1):
            for col in range(merge_range.min_col, merge_range.max_col + 1):
                ws.cell(row=row, column=col).value = top_left_value

    # Sauvegarder dans un buffer
    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer

def detect_column_type(series):
    """Détecte automatiquement le type de chaque colonne"""
    try:
        numeric = pd.to_numeric(series.dropna(), errors='raise')
        unique_vals = numeric.unique()
        if set(unique_vals).issubset({0, 1}):
            return "boolean"
        return "number"
    except:
        pass

    try:
        pd.to_datetime(series.dropna(), infer_datetime_format=True)
        return "date"
    except:
        pass

    unique_lower = series.dropna().astype(str).str.lower().unique()
    bool_keywords = {"oui","non","yes","no","true","false","présent","absent","actif","inactif"}
    if set(unique_lower).issubset(bool_keywords):
        return "boolean"

    return "category"

def analyze_excel(df):
    """Analyse automatique complète du fichier Excel"""
    result = {
        "summary": {},
        "columns": {},
        "kpis": [],
        "charts": [],
        "alerts": [],
        "anomalies": []
    }

    # Résumé général
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

    # KPIs pour colonnes numériques
    for col in number_cols:
        clean = df[col].dropna()
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
                "message": f"Valeur anormalement élevée détectée dans '{col}': {round(float(clean.max()), 2)}"
            })

    # Graphiques : Date + Nombre
    for date_col in date_cols:
        for num_col in number_cols:
            try:
                time_series = df.groupby(df[date_col].dt.to_period("M"))[num_col].sum()
                values = [round(float(v), 2) for v in time_series.values]
                labels = [str(p) for p in time_series.index]

                if len(values) >= 2 and values[-1] < values[-2] * 0.8:
                    result["alerts"].append({
                        "type": "danger",
                        "message": f"Baisse de plus de 20% détectée sur '{num_col}'"
                    })

                result["charts"].append({
                    "type": "line",
                    "title": f"Évolution de {num_col} par mois",
                    "labels": labels,
                    "values": values,
                    "x_col": date_col,
                    "y_col": num_col
                })
            except:
                pass

    # Graphiques : Catégorie + Nombre
    for cat_col in category_cols:
        for num_col in number_cols:
            grouped = df.groupby(cat_col)[num_col].sum().sort_values(ascending=False).head(10)
            result["charts"].append({
                "type": "bar",
                "title": f"{num_col} par {cat_col}",
                "labels": [str(l) for l in grouped.index.tolist()],
                "values": [round(float(v), 2) for v in grouped.values.tolist()],
                "x_col": cat_col,
                "y_col": num_col
            })

    # Graphiques : Booléen
    for bool_col in boolean_cols:
        counts = df[bool_col].astype(str).str.lower().value_counts()
        result["charts"].append({
            "type": "donut",
            "title": f"Répartition de {bool_col}",
            "labels": counts.index.tolist(),
            "values": [int(v) for v in counts.values.tolist()]
        })

    # Détection anomalies
    for col in number_cols:
        clean = df[col].dropna()
        mean = clean.mean()
        std = clean.std()
        outliers = df[abs(df[col] - mean) > 3 * std]
        if not outliers.empty:
            result["anomalies"].append({
                "column": col,
                "count": len(outliers),
                "message": f"{len(outliers)} valeur(s) aberrante(s) détectée(s) dans '{col}'"
            })

    return result

@app.get("/")
def root():
    return {"message": "Smart Excel Analyzer API is running 🚀"}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        # Traitement cellules fusionnées
        try:
            cleaned_buffer = unmerge_and_fill(contents)
            df = pd.read_excel(cleaned_buffer)
        except Exception:
            # Fallback si openpyxl échoue
            df = pd.read_excel(BytesIO(contents))

        # Nettoyage colonnes Unnamed
        df = df.loc[:, ~df.columns.astype(str).str.startswith('Unnamed')]

        # Remplissage forward fill pour colonnes catégories fusionnées
        for col in df.columns:
            if df[col].dtype == object:
                df[col] = df[col].fillna(method='ffill')

        result = analyze_excel(df)
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}
