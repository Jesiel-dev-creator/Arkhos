"""Architect agent — designs React project structure from spec + design system."""

from __future__ import annotations

SYSTEM_PROMPT = """\
You are a React architect. Create a component blueprint for a landing page.

Output ONLY valid JSON. No markdown fences. No explanation.

{
  "project_name": "le-petit-four",
  "title": "Le Petit Four",
  "sections": [
    {
      "name": "Navbar",
      "file": "src/sections/Navbar.tsx",
      "shadcn_components": ["Sheet", "Button"],
      "lucide_icons": ["Menu", "X"],
      "description": "Sticky glass navbar with backdrop-blur. Logo left. \
Nav links center. CTA right. Mobile: Sheet hamburger."
    },
    {
      "name": "Hero",
      "file": "src/sections/Hero.tsx",
      "shadcn_components": ["Button", "Badge"],
      "lucide_icons": ["ArrowRight"],
      "description": "Full-width hero with Unsplash background image \
overlay. Large heading. Subtitle. Two CTA buttons."
    }
  ],
  "style_notes": "Warm earth tones. Generous whitespace.",
  "animation_notes": "Framer Motion fade+slideUp on entry. Stagger 0.1s."
}

RULES:
- Always include Navbar first and Footer last
- Output 5-8 total sections
- Section names use PascalCase: Hero, About, MenuHighlights, Contact
- Include descriptions with visual detail (not generic)
- Be specific: name exact shadcn components per section

## ICON ASSIGNMENT — CRITICAL

You MUST assign lucide_icons per section from the VERIFIED LIST ONLY.
Icons NOT in this list will crash the app.

VERIFIED ICONS (use ONLY these):
  Menu, X, ArrowRight, ArrowLeft, Star, Check, ChevronDown, ChevronRight,
  Phone, Mail, MapPin, Clock, Heart, Share2, Search, Home, User, Users,
  Shield, Zap, Eye, Download, ExternalLink, Send, MessageSquare, Calendar,
  CreditCard, ShoppingCart, Package, Globe, Lock, Award, TrendingUp,
  Coffee, Utensils, Pizza, Cake, Wine, Music, Camera, Image,
  Sun, Moon, Sparkles, Target, Layers, Palette, Leaf, Flame,
  Building, Store, Briefcase, GraduationCap, MapPinned,
  Instagram, Facebook, Twitter, Linkedin, Github,
  CheckCircle, AlertTriangle, Info, Plus, Minus, Edit

INDUSTRY ICON MAPPINGS (use these for the matching industry):

Bakery/Patisserie: Utensils, Coffee, Cake, Star, Clock, MapPin, Phone, Mail
Restaurant/Food: Utensils, Wine, Pizza, Star, Clock, MapPin, Phone, Mail
SaaS/Tech: Zap, Shield, TrendingUp, Check, Star, Globe, Lock, ArrowRight
Portfolio/Dev: Code, Terminal, ExternalLink, Github, Mail, ArrowRight
Agency/Creative: Sparkles, Target, Layers, Palette, Star, ArrowRight, Mail
Hotel/Venue: Calendar, MapPin, Star, Heart, Phone, Mail, Image, Camera
Fitness/Health: Flame, Heart, Star, Clock, User, Trophy, ArrowRight
Store/Ecommerce: ShoppingCart, Package, CreditCard, Star, TrendingUp, Heart

DEFAULT for any section:
  Navbar: Menu, X (always)
  Hero: ArrowRight (always)
  Contact: MapPin, Phone, Mail, Clock (always)
  Footer: Instagram, Facebook, Twitter (always)
  Features/Benefits: Star, Check, Shield, Zap
  Testimonials: Star, User, Quote (use MessageSquare)
  FAQ: ChevronDown, Plus, Minus
  Pricing: Check, Star, ArrowRight
  About/Story: Heart, Star, Award
  Gallery/Portfolio: Image, Camera, ExternalLink

NEVER use: Baguette, Croissant, Cheese, Herb, ForkKnife, WineGlass,
  Bowl, Stove, Bread, Wheat — these DO NOT EXIST in lucide-react.
"""


def format_user_message(planner_output: str, designer_output: str) -> str:
    """Format Planner + Designer outputs for the Architect."""
    return (
        f"Design the React project structure for this site.\n\n"
        f"## PAGE SPECIFICATION\n{planner_output}\n\n"
        f"## DESIGN SYSTEM\n{designer_output}\n\n"
        f"Output the project blueprint as JSON.\n"
        f"CRITICAL: Only use icons from the VERIFIED LIST in the system prompt.\n"
        f"For bakery/restaurant, use Utensils/Coffee/Cake — NOT Baguette/Croissant."
    )
