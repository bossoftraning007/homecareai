"""Kitchen Pharmacy Scanner API
Matches user ingredients against home remedy database.
"""
from fastapi import APIRouter, Request, HTTPException
from config.database import get_supabase

router = APIRouter()

# Common ingredient synonyms for matching
INGREDIENT_SYNONYMS = {
    'turmeric': ['turmeric', 'haldi', 'curcumin'],
    'ginger': ['ginger', 'adrak', 'adrakh'],
    'garlic': ['garlic', 'lahsun', 'lehsun'],
    'honey': ['honey', 'shahad', 'madhu'],
    'lemon': ['lemon', 'nimbu', 'lime', 'citrus'],
    'milk': ['milk', 'doodh', 'dairy'],
    'water': ['water', 'paani', 'jal'],
    'tulsi': ['tulsi', 'basil', 'holy basil'],
    'cinnamon': ['cinnamon', 'dalchini', 'darchini'],
    'clove': ['clove', 'laung', 'lavang'],
    'black_pepper': ['pepper', 'black pepper', 'kali mirch', 'mirch'],
    'cumin_seeds': ['cumin', 'jeera', 'zeera'],
    'coriander_seeds': ['coriander', 'dhania', 'dhaniya'],
    'fenugreek_seeds': ['fenugreek', 'methi', 'methi seeds'],
    'fennel_seeds': ['fennel', 'saunf', 'sonf'],
    'ajwain': ['ajwain', 'carom seeds', 'ajwain seeds'],
    'coconut_oil': ['coconut oil', 'nariyal tel', 'coconut'],
    'sesame_oil': ['sesame oil', 'til oil', 'gingelly oil'],
    'onion': ['onion', 'pyaz'],
    'curd': ['curd', 'yogurt', 'dahi', 'yoghurt'],
    'multani_mitti': ['multani mitti', 'fuller earth', 'mitti'],
    'rose_water': ['rose water', 'gulab jal'],
    'aloe_vera': ['aloe vera', 'aloe', 'gwar patha', 'kumari'],
}


def normalize_ingredient(name: str) -> str:
    """Map user input to canonical ingredient name."""
    name_lower = name.lower().strip()
    for canonical, synonyms in INGREDIENT_SYNONYMS.items():
        for synonym in synonyms:
            if synonym in name_lower or name_lower in synonym:
                return canonical
    return name_lower


@router.get("/kitchen-remedies")
async def get_all_remedies(request: Request):
    """Get all published kitchen remedies."""
    try:
        supabase = get_supabase()
        result = supabase.table("kitchen_remedies").select("*").eq("is_published", True).order("created_at", ascending=False).execute()
        return {"remedies": result.data or []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/kitchen-remedies/match")
async def match_remedies(request: Request):
    """Match user's available ingredients against remedies database."""
    try:
        body = await request.json()
        user_ingredients = body.get("ingredients", [])
        user_concern = body.get("concern", "").lower() if body.get("concern") else None

        if not user_ingredients:
            raise HTTPException(status_code=400, detail="Please provide at least one ingredient")

        # Normalize user ingredients
        normalized = [normalize_ingredient(ing) for ing in user_ingredients]
        normalized_set = set(normalized)

        # Get all remedies
        supabase = get_supabase()
        result = supabase.table("kitchen_remedies").select("*").eq("is_published", True).execute()
        all_remedies = result.data or []

        # Score each remedy by how many ingredients user has
        matches = []
        for remedy in all_remedies:
            required = [normalize_ingredient(i) for i in remedy.get("ingredients", [])]
            required_set = set(required)
            user_has = normalized_set & required_set
            missing = required_set - normalized_set

            if not user_has:
                continue  # Skip if user has none of the ingredients

            # Calculate match score (% of ingredients user has)
            match_pct = int((len(user_has) / len(required_set)) * 100)

            # Filter by concern if provided
            if user_concern:
                remedy_uses = [u.lower() for u in remedy.get("uses", [])]
                if user_concern not in remedy_uses and not any(user_concern in u for u in remedy_uses):
                    # Only show if 80%+ match OR user is looking for general help
                    if match_pct < 80:
                        continue

            matches.append({
                **remedy,
                "match_score": match_pct,
                "ingredients_user_has": list(user_has),
                "ingredients_missing": list(missing),
                "missing_count": len(missing),
            })

        # Sort by: match_score DESC, missing_count ASC, prep_time ASC
        matches.sort(key=lambda r: (-r["match_score"], r["missing_count"], r.get("prep_time", 999)))

        return {
            "user_ingredients": user_ingredients,
            "normalized": list(normalized_set),
            "concern": user_concern,
            "total_remedies_found": len(matches),
            "remedies": matches[:20],  # Top 20
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/kitchen-remedies/concerns")
async def get_concerns(request: Request):
    """Get list of all health concerns covered by remedies."""
    try:
        supabase = get_supabase()
        result = supabase.table("kitchen_remedies").select("uses").eq("is_published", True).execute()
        all_uses = set()
        for r in result.data or []:
            for u in r.get("uses", []):
                all_uses.add(u)
        return {"concerns": sorted(all_uses)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
