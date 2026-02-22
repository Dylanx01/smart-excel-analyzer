import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# ============================================
# Fichier 1 — RH / Gestion du Personnel
# ============================================
np.random.seed(42)
n = 50
noms = ['Alice','Bob','Clara','David','Emma','Frank','Grace','Hugo','Iris','Jules',
        'Kara','Leo','Mia','Noah','Olivia','Paul','Quinn','Rose','Sam','Tina',
        'Uma','Victor','Wendy','Xavier','Yara','Zack','Amel','Bruno','Celine','Denis',
        'Elise','Fabrice','Gina','Henri','Inès','Jacques','Karima','Laurent','Marie','Nicolas',
        'Ophe','Pierre','Rachel','Sonia','Thomas','Ursula','Valerie','William','Xena','Yves']

df_rh = pd.DataFrame({
    'Nom': noms[:n],
    'Departement': np.random.choice(['RH','Finance','IT','Marketing','Operations','Direction'], n),
    'Poste': np.random.choice(['Analyste','Manager','Directeur','Assistant','Ingenieur','Consultant'], n),
    'Contrat': np.random.choice(['CDI','CDD','Stage','Freelance'], n),
    'Salaire': np.random.randint(150000, 900000, n),
    'Anciennete_Ans': np.random.randint(0, 20, n),
    'Absences_Jours': np.random.randint(0, 30, n),
    'Date_Embauche': [datetime(2020,1,1) + timedelta(days=random.randint(0,1500)) for _ in range(n)],
})
df_rh.to_excel('test_rh_personnel.xlsx', index=False)
print('✅ test_rh_personnel.xlsx créé !')

# ============================================
# Fichier 2 — Ventes / Commerce
# ============================================
produits = ['Laptop','Smartphone','Tablette','Imprimante','Clavier','Souris','Ecran','Casque',
            'Webcam','Disque Dur','RAM','GPU','CPU','Batterie','Chargeur','Cable HDMI',
            'Hub USB','SSD','Router','Switch']

df_ventes = pd.DataFrame({
    'Date_Vente': [datetime(2024,1,1) + timedelta(days=random.randint(0,365)) for _ in range(50)],
    'Produit': np.random.choice(produits, 50),
    'Categorie': np.random.choice(['Informatique','Accessoires','Stockage','Reseau','Audio'], 50),
    'Quantite': np.random.randint(1, 50, 50),
    'Prix_Unitaire': np.random.randint(5000, 500000, 50),
    'Remise_Pct': np.random.choice([0, 5, 10, 15, 20], 50),
    'Montant_Total': np.random.randint(10000, 2000000, 50),
    'Vendeur': np.random.choice(['Dupont','Martin','Bernard','Thomas','Petit'], 50),
})
df_ventes.to_excel('test_ventes_commerce.xlsx', index=False)
print('✅ test_ventes_commerce.xlsx créé !')

# ============================================
# Fichier 3 — Finance / Comptabilité
# ============================================
categories_finance = ['Salaires','Loyer','Electricite','Internet','Fournitures',
                       'Marketing','Transport','Formation','Maintenance','Assurance']

df_finance = pd.DataFrame({
    'Date': [datetime(2024,1,1) + timedelta(days=random.randint(0,365)) for _ in range(50)],
    'Categorie': np.random.choice(categories_finance, 50),
    'Type': np.random.choice(['Depense','Revenu'], 50),
    'Montant': np.random.randint(10000, 5000000, 50),
    'Statut': np.random.choice(['Paye','En_attente','Annule'], 50),
    'Mode_Paiement': np.random.choice(['Virement','Especes','Mobile_Money','Cheque'], 50),
    'Responsable': np.random.choice(['DAF','DG','RH','IT','Marketing'], 50),
    'Budget_Prevu': np.random.randint(50000, 6000000, 50),
})
df_finance.to_excel('test_finance_comptabilite.xlsx', index=False)
print('✅ test_finance_comptabilite.xlsx créé !')

# ============================================
# Fichier 4 — Santé / Clinique
# ============================================
df_sante = pd.DataFrame({
    'Date_Consultation': [datetime(2024,1,1) + timedelta(days=random.randint(0,365)) for _ in range(50)],
    'Patient_ID': [f'PAT{str(i).zfill(4)}' for i in range(1, 51)],
    'Age': np.random.randint(5, 80, 50),
    'Specialite': np.random.choice(['Cardiologie','Pediatrie','Dermatologie','Gynecologie','Generaliste'], 50),
    'Diagnostic': np.random.choice(['Grippe','Hypertension','Diabete','Paludisme','Consultation'], 50),
    'Cout_Consultation': np.random.randint(5000, 100000, 50),
    'Duree_Sejour_Jours': np.random.randint(0, 30, 50),
    'Statut_Paiement': np.random.choice(['Paye','Partiel','Impaye'], 50),
})
df_sante.to_excel('test_sante_clinique.xlsx', index=False)
print('✅ test_sante_clinique.xlsx créé !')

# ============================================
# Fichier 5 — Education / Ecole
# ============================================
matieres = ['Mathematiques','Physique','Chimie','Biologie','Histoire','Geographie',
            'Francais','Anglais','Informatique','Sport']

df_education = pd.DataFrame({
    'Eleve': [f'Eleve_{i}' for i in range(1, 51)],
    'Classe': np.random.choice(['3eme','2nde','1ere','Terminale'], 50),
    'Matiere': np.random.choice(matieres, 50),
    'Note_Sur_20': np.round(np.random.uniform(4, 20, 50), 1),
    'Moyenne_Classe': np.round(np.random.uniform(8, 16, 50), 1),
    'Absences_Heures': np.random.randint(0, 50, 50),
    'Rang': np.random.randint(1, 50, 50),
    'Date_Examen': [datetime(2024,1,1) + timedelta(days=random.randint(0,300)) for _ in range(50)],
})
df_education.to_excel('test_education_ecole.xlsx', index=False)
print('✅ test_education_ecole.xlsx créé !')

print('\n🎉 Tous les fichiers de test sont créés avec succès !')
