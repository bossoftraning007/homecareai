from fastapi import APIRouter, HTTPException, Header
from supabase import create_client
from pydantic import BaseModel
from typing import List, Optional
import os
import re

router = APIRouter()

supabase_url = os.environ.get("SUPABASE_URL", "")
supabase_service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
admin_secret = os.environ.get("ADMIN_SECRET_TOKEN", "PQjtStLZHnGYWSLR5ox_1cp75t20GOXeZk_xjfisfGo")

supabase_admin = None
if supabase_url and supabase_service_key:
    try:
        supabase_admin = create_client(supabase_url, supabase_service_key)
    except Exception as e:
        print(f"Warning: Failed to create Supabase admin client for articles: {e}")


def require_admin(authorization: Optional[str] = Header(None), x_admin_secret: Optional[str] = Header(None)):
    """Verify admin access via secret token header."""
    # Allow either ADMIN_SECRET_TOKEN header or Bearer token matching it
    if x_admin_secret and x_admin_secret == admin_secret:
        return True
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "").strip()
        if token == admin_secret:
            return True
    raise HTTPException(status_code=403, detail="Admin access required")


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text[:80]


class ArticleCreate(BaseModel):
    title: str
    summary: str
    content: str
    category: str
    tags: List[str] = []
    read_time: int = 5
    author: str = "HomeCare AI"
    image_url: Optional[str] = None
    author_email: Optional[str] = None
    is_featured: bool = False
    is_published: bool = True


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    read_time: Optional[int] = None
    author: Optional[str] = None
    image_url: Optional[str] = None
    is_featured: Optional[bool] = None
    is_published: Optional[bool] = None


@router.get("/admin/articles")
async def list_all_articles(authorization: Optional[str] = Header(None), x_admin_secret: Optional[str] = Header(None)):
    """List ALL articles (published + drafts). Admin only."""
    require_admin(authorization, x_admin_secret)
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Service role key not configured")

    try:
        response = supabase_admin.table('health_articles').select('*').order('created_at', desc=True).execute()
        return {"success": True, "articles": response.data or [], "total": len(response.data or [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/articles")
async def create_article(payload: ArticleCreate, authorization: Optional[str] = Header(None), x_admin_secret: Optional[str] = Header(None)):
    """Create a new article. Admin only."""
    require_admin(authorization, x_admin_secret)
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Service role key not configured")

    if not payload.title.strip() or not payload.content.strip():
        raise HTTPException(status_code=400, detail="Title and content are required")

    slug = slugify(payload.title)

    # Ensure unique slug
    try:
        existing = supabase_admin.table('health_articles').select('slug').eq('slug', slug).execute()
        if existing.data and len(existing.data) > 0:
            slug = f"{slug}-{int(__import__('time').time())}"
    except:
        pass

    record = {
        "slug": slug,
        "title": payload.title.strip(),
        "summary": payload.summary.strip(),
        "content": payload.content,
        "category": payload.category,
        "tags": payload.tags or [],
        "read_time": payload.read_time,
        "author": payload.author or "HomeCare AI",
        "is_featured": payload.is_featured,
        "is_published": payload.is_published,
        "views": 0,
        "image_url": payload.image_url,
        "author_email": payload.author_email,
    }

    try:
        response = supabase_admin.table('health_articles').insert(record).execute()
        return {"success": True, "article": response.data[0] if response.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/admin/articles/{article_id}")
async def update_article(article_id: str, payload: ArticleUpdate, authorization: Optional[str] = Header(None), x_admin_secret: Optional[str] = Header(None)):
    """Update an article. Admin only."""
    require_admin(authorization, x_admin_secret)
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Service role key not configured")

    updates = {k: v for k, v in payload.dict(exclude_none=True).items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    # If title changed, regenerate slug
    if "title" in updates:
        new_slug = slugify(updates["title"])
        try:
            existing = supabase_admin.table('health_articles').select('id, slug').eq('slug', new_slug).neq('id', article_id).execute()
            if existing.data and len(existing.data) > 0:
                new_slug = f"{new_slug}-{int(__import__('time').time())}"
            updates["slug"] = new_slug
        except:
            pass

    updates["updated_at"] = "now()"

    try:
        response = supabase_admin.table('health_articles').update(updates).eq('id', article_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Article not found")
        return {"success": True, "article": response.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/admin/articles/{article_id}")
async def delete_article(article_id: str, authorization: Optional[str] = Header(None), x_admin_secret: Optional[str] = Header(None)):
    """Delete an article. Admin only."""
    require_admin(authorization, x_admin_secret)
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Service role key not configured")

    try:
        response = supabase_admin.table('health_articles').delete().eq('id', article_id).execute()
        return {"success": True, "deleted": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/admin/articles/{article_id}/toggle-publish")
async def toggle_publish(article_id: str, authorization: Optional[str] = Header(None), x_admin_secret: Optional[str] = Header(None)):
    """Toggle is_published for an article."""
    require_admin(authorization, x_admin_secret)
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Service role key not configured")

    try:
        current = supabase_admin.table('health_articles').select('is_published').eq('id', article_id).execute()
        if not current.data:
            raise HTTPException(status_code=404, detail="Article not found")
        new_val = not current.data[0].get('is_published', True)
        response = supabase_admin.table('health_articles').update({'is_published': new_val, 'updated_at': 'now()'}).eq('id', article_id).execute()
        return {"success": True, "is_published": new_val, "article": response.data[0] if response.data else None}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/categories")
async def list_categories(authorization: Optional[str] = Header(None), x_admin_secret: Optional[str] = Header(None)):
    """List article categories. Admin only."""
    require_admin(authorization, x_admin_secret)
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Service role key not configured")

    try:
        response = supabase_admin.table('article_categories').select('*').eq('is_active', True).order('sort_order').execute()
        return {"success": True, "categories": response.data or []}
    except Exception as e:
        # Fallback to hardcoded list
        return {
            "success": True,
            "categories": [
                {"key": "nutrition", "label": "Nutrition", "icon": "🍎"},
                {"key": "sleep", "label": "Sleep", "icon": "😴"},
                {"key": "mental_health", "label": "Mental Health", "icon": "🧠"},
                {"key": "exercise", "label": "Exercise", "icon": "🏃"},
                {"key": "remedies", "label": "Remedies", "icon": "🌿"},
                {"key": "conditions", "label": "Conditions", "icon": "🩺"},
                {"key": "prevention", "label": "Prevention", "icon": "🛡️"},
                {"key": "wellness", "label": "Wellness", "icon": "✨"},
                {"key": "news", "label": "Health News", "icon": "📰"},
            ]
        }