import pandas as pd
from client import supabase

def seed_database():
    print("Loading training data CSV...")
    df = pd.read_csv("ml/training_data.csv")

    # Supabase accepts list of dicts — insert in batches of 500
    records = df.to_dict(orient="records")
    batch_size = 500

    for i in range(0, len(records), batch_size):
        batch = records[i:i+batch_size]
        supabase.table("your_table_name").insert(batch).execute()
        print(f"Inserted rows {i} to {i+len(batch)}")

if __name__ == "__main__":
    seed_database()
