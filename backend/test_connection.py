from database.client import supabase

try:
    print("Testing Supabase Connection...")
    result = supabase.table("workers").select("*").limit(3).execute()
    print("Connection successful! Fetched data:")
    print(result.data)
except Exception as e:
    print("Connection failed with error:")
    print(e)
