"""
Spending persona profiles — each maps to a distinct Nessie account.
"""
from typing import Optional

PROFILES = [
    {
        "id": "alex",
        "name": "Alex Chen",
        "description": "Clothing binge this week",
        "nessie_account_id": "69daf1582395a9074d5a4b7b",
        "avatar": "👗",
    },
    {
        "id": "jordan",
        "name": "Jordan Rivera",
        "description": "Dining & Entertainment lover",
        "nessie_account_id": "69db1c6c2395a9074d5a4be7",
        "avatar": "🎭",
    },
    {
        "id": "sam",
        "name": "Sam Patel",
        "description": "Serial shopper & subscription stacker",
        "nessie_account_id": "69db1c6c2395a9074d5a4be8",
        "avatar": "🛒",
    },
]

_by_id = {p["id"]: p for p in PROFILES}

DEFAULT_PROFILE_ID = "alex"


def get_profile(profile_id: Optional[str]) -> dict:
    """Return profile dict; falls back to default if ID is unknown."""
    return _by_id.get(profile_id or DEFAULT_PROFILE_ID, _by_id[DEFAULT_PROFILE_ID])


def get_account_id(profile_id: Optional[str]) -> str:
    return get_profile(profile_id)["nessie_account_id"]


def mock_file_suffix(profile_id: Optional[str]) -> str:
    """Filename suffix for profile-specific mock data, e.g. '_jordan'. Alex (the
    default profile) has no suffix — its files are the original unsuffixed ones."""
    pid = get_profile(profile_id)["id"]
    return "" if pid == DEFAULT_PROFILE_ID else f"_{pid}"
