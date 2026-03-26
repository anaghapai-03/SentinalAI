import random
import pandas as pd

data = []

for _ in range(3000):
    time = random.randint(0, 23)
    day = random.randint(0, 6)
    crowd = round(random.uniform(0, 1), 2)
    lighting = round(random.uniform(0, 1), 2)
    incidents = random.randint(0, 20)

    if (time >= 21 and lighting < 0.4 and crowd > 0.6):
        risk = 1
    elif incidents > 15:
        risk = 1
    elif (crowd > 0.8 and lighting < 0.5):
        risk = 1
    else:
        risk = 0

    data.append([time, day, crowd, lighting, incidents, risk])

df = pd.DataFrame(data, columns=[
    'time','day','crowd','lighting','incidents','risk'
])

df.to_csv("dataset.csv", index=False)
print("Dataset created")