import pandas as pd

df = pd.DataFrame({
    'Employe': ['Alice','Bob','Clara','David','Emma','Frank','Grace','Hugo'],
    'Departement': ['RH','Finance','IT','RH','Finance','IT','RH','Finance'],
    'Salaire': [450000,620000,580000,430000,700000,550000,480000,610000],
    'Absences': [2,0,5,1,0,3,2,1],
    'Contrat': ['CDI','CDI','CDD','CDI','CDI','CDD','CDI','CDD'],
    'Date_embauche': pd.date_range('2020-01-01', periods=8, freq='3ME'),
    'Prime': [50000,80000,60000,45000,90000,55000,50000,75000],
    'Actif': ['Oui','Oui','Oui','Non','Oui','Oui','Non','Oui']
})

df.to_excel('test_cecaw.xlsx', index=False)
print('Fichier test_cecaw.xlsx créé avec succès !')
