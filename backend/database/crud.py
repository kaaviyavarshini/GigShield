from database.client import supabase
from datetime import date, timedelta

# INSERT a new worker
def save_worker(profile: dict):
    result = supabase.table("workers").insert({
        "name":                profile["name"],
        "platform":            profile["platform"],
        "zone":                profile["zone"],
        "avg_weekly_earnings": profile["weekly_earnings"]
    }).execute()
    return result.data[0]  # returns the new row with its UUID

# INSERT a new policy after premium is calculated
def create_policy(worker_id: str, premium: float, coverage: float):
    result = supabase.table("policies").insert({
        "worker_id":       worker_id,
        "week_start":      str(date.today()),
        "week_end":        str(date.today() + timedelta(days=7)),
        "weekly_premium":  premium,
        "coverage_amount": coverage,
        "status":          "active"
    }).execute()
    return result.data[0]

# READ all active policies for a zone (for trigger monitoring)
def get_active_policies(zone: str):
    result = supabase.table("policies")\
        .select("*, workers!inner(zone)")\
        .eq("workers.zone", zone)\
        .eq("status", "active")\
        .execute()
    return result.data

# UPDATE claim status after fraud check
def approve_claim(claim_id: str, payout_amount: float):
    supabase.table("claims").update({
        "status":        "approved",
        "payout_amount": payout_amount
    }).eq("id", claim_id).execute()
