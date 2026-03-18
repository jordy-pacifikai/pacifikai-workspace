#!/bin/bash
# Generate test pages for all 12 templates with sample data
# Output to landing-page/demo/templates/

TEMPLATES_DIR="/Users/jordybanks/Documents/PACIFIKAI/Argentic Workflows/PACIFIK'AI/prospection/templates"
DEMO_DIR="/Users/jordybanks/Documents/PACIFIKAI/Argentic Workflows/PACIFIK'AI/landing-page/demo/templates"

mkdir -p "$DEMO_DIR"

# Sample images from Unsplash (free, no auth needed)
HERO_BEAUTY="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80"
HERO_FOOD="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80"
HERO_AUTO="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80"
HERO_HEALTH="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&q=80"

GAL_BEAUTY_1="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80"
GAL_BEAUTY_2="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80"
GAL_BEAUTY_3="https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&q=80"
GAL_BEAUTY_4="https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80"
GAL_BEAUTY_5="https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=600&q=80"
GAL_BEAUTY_6="https://images.unsplash.com/photo-1470259078422-826894b933aa?w=600&q=80"

GAL_FOOD_1="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80"
GAL_FOOD_2="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80"
GAL_FOOD_3="https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=80"
GAL_FOOD_4="https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=80"
GAL_FOOD_5="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80"
GAL_FOOD_6="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80"

GAL_AUTO_1="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80"
GAL_AUTO_2="https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&q=80"
GAL_AUTO_3="https://images.unsplash.com/photo-1493238792000-8113da705763?w=600&q=80"
GAL_AUTO_4="https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=600&q=80"
GAL_AUTO_5="https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=600&q=80"
GAL_AUTO_6="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80"

GAL_HEALTH_1="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80"
GAL_HEALTH_2="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80"
GAL_HEALTH_3="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&q=80"
GAL_HEALTH_4="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&q=80"
GAL_HEALTH_5="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80"
GAL_HEALTH_6="https://images.unsplash.com/photo-1551190822-a9ce113ac100?w=600&q=80"

generate_page() {
  local template_file="$1"
  local template_name="$2"
  local sector="$3"
  local biz_name="$4"
  local tagline="$5"
  local city="$6"
  local subsector="$7"
  local color_bg="$8"
  local color_accent="$9"
  local color_text="${10}"
  local font_display="${11}"
  local font_body="${12}"
  local hero_img="${13}"
  local gal1="${14}" gal2="${15}" gal3="${16}" gal4="${17}" gal5="${18}" gal6="${19}"

  local output="$DEMO_DIR/$template_name.html"

  cp "$template_file" "$output"

  # Replace all placeholders
  sed -i '' "s|{{BUSINESS_NAME}}|$biz_name|g" "$output"
  sed -i '' "s|{{TAGLINE}}|$tagline|g" "$output"
  sed -i '' "s|{{CITY}}|$city|g" "$output"
  sed -i '' "s|{{SUBSECTOR}}|$subsector|g" "$output"
  sed -i '' "s|{{COLOR_BG}}|$color_bg|g" "$output"
  sed -i '' "s|{{COLOR_ACCENT}}|$color_accent|g" "$output"
  sed -i '' "s|{{COLOR_TEXT}}|$color_text|g" "$output"
  sed -i '' "s|{{FONT_DISPLAY}}|$font_display|g" "$output"
  sed -i '' "s|{{FONT_BODY}}|$font_body|g" "$output"
  sed -i '' "s|{{HERO_IMAGE}}|$hero_img|g" "$output"
  sed -i '' "s|{{GALLERY_1}}|$gal1|g" "$output"
  sed -i '' "s|{{GALLERY_2}}|$gal2|g" "$output"
  sed -i '' "s|{{GALLERY_3}}|$gal3|g" "$output"
  sed -i '' "s|{{GALLERY_4}}|$gal4|g" "$output"
  sed -i '' "s|{{GALLERY_5}}|$gal5|g" "$output"
  sed -i '' "s|{{GALLERY_6}}|$gal6|g" "$output"
  sed -i '' "s|{{COUNTER_1_VALUE}}|10+|g" "$output"
  sed -i '' "s|{{COUNTER_1_LABEL}}|Années d'expérience|g" "$output"
  sed -i '' "s|{{COUNTER_2_VALUE}}|500+|g" "$output"
  sed -i '' "s|{{COUNTER_2_LABEL}}|Clients satisfaits|g" "$output"
  sed -i '' "s|{{COUNTER_3_VALUE}}|100%|g" "$output"
  sed -i '' "s|{{COUNTER_3_LABEL}}|Satisfaction|g" "$output"
  sed -i '' "s|{{STEP_1_TITLE}}|Réservation|g" "$output"
  sed -i '' "s|{{STEP_1_DESC}}|Prenez rendez-vous en ligne ou par téléphone.|g" "$output"
  sed -i '' "s|{{STEP_2_TITLE}}|Consultation|g" "$output"
  sed -i '' "s|{{STEP_2_DESC}}|Votre spécialiste évalue vos besoins.|g" "$output"
  sed -i '' "s|{{STEP_3_TITLE}}|Résultat|g" "$output"
  sed -i '' "s|{{STEP_3_DESC}}|Repartez satisfait(e) et sublimé(e).|g" "$output"
  sed -i '' "s|{{TESTIMONIAL_TEXT}}|Un service exceptionnel, je recommande les yeux fermés.|g" "$output"
  sed -i '' "s|{{TESTIMONIAL_AUTHOR}}|Marie, Papeete|g" "$output"
  sed -i '' "s|{{CTA_TEXT}}|Prêt(e) à nous faire confiance ?|g" "$output"
  sed -i '' "s|{{PHONE}}|+689 40 00 00 00|g" "$output"
  sed -i '' "s|{{EMAIL}}|contact@exemple.pf|g" "$output"
  # Extra placeholders some templates may have
  sed -i '' "s|{{ACCENT_RGB}}|196,93,62|g" "$output"
  sed -i '' "s|{{COUNTER_1_PERCENT}}|75|g" "$output"
  sed -i '' "s|{{COUNTER_2_PERCENT}}|90|g" "$output"
  sed -i '' "s|{{COUNTER_3_PERCENT}}|100|g" "$output"
  sed -i '' "s|{{COUNTER_1_SUFFIX}}|+|g" "$output"
  sed -i '' "s|{{COUNTER_2_SUFFIX}}|+|g" "$output"
  sed -i '' "s|{{COUNTER_3_SUFFIX}}|%|g" "$output"
  sed -i '' "s|{{SERVICES_TITLE}}|Nos Services|g" "$output"
  sed -i '' "s|{{SERVICE_1}}|Service Premium|g" "$output"
  sed -i '' "s|{{SERVICE_2}}|Conseil Expert|g" "$output"
  sed -i '' "s|{{SERVICE_3}}|Suivi Personnalisé|g" "$output"
  sed -i '' "s|{{SERVICE_4}}|Diagnostic|g" "$output"
  sed -i '' "s|{{SERVICE_5}}|Réparation|g" "$output"
  sed -i '' "s|{{SERVICE_6}}|Entretien|g" "$output"
  sed -i '' "s|{{DESCRIPTION}}|Votre partenaire de confiance à Tahiti depuis plus de 10 ans.|g" "$output"
  sed -i '' "s|{{GOOGLE_FONTS_URL}}|https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700\&family=Inter:wght@300;400;500\&display=swap|g" "$output"
  # Catch remaining placeholders with generic text
  sed -i '' 's|{{[A-Z_]*}}||g' "$output"

  echo "  ✓ $template_name"
}

echo "Generating 12 test pages..."

# BEAUTY templates
generate_page "$TEMPLATES_DIR/beauty-1.html" "beauty-1" "beauty" "Salon Kantuta" "Votre beauté, notre passion" "Papeete" "Coiffeur" "#0A0A0A" "#C45D3E" "#E8E0D4" "Cormorant Garamond" "Inter" "$HERO_BEAUTY" "$GAL_BEAUTY_1" "$GAL_BEAUTY_2" "$GAL_BEAUTY_3" "$GAL_BEAUTY_4" "$GAL_BEAUTY_5" "$GAL_BEAUTY_6"

generate_page "$TEMPLATES_DIR/beauty-2.html" "beauty-2" "beauty" "Luminescence Spa" "L'art de sublimer votre beauté" "Papeete" "Spa" "#FFF8F5" "#D4A574" "#2D2D2D" "Playfair Display" "DM Sans" "$HERO_BEAUTY" "$GAL_BEAUTY_1" "$GAL_BEAUTY_2" "$GAL_BEAUTY_3" "$GAL_BEAUTY_4" "$GAL_BEAUTY_5" "$GAL_BEAUTY_6"

generate_page "$TEMPLATES_DIR/beauty-3.html" "beauty-3" "beauty" "Ohana Nails" "Beauté & Bien-être sur mesure" "Punaauia" "Onglerie" "#FAF7F2" "#0D9488" "#1A1A1A" "Cormorant Garamond" "DM Sans" "$HERO_BEAUTY" "$GAL_BEAUTY_1" "$GAL_BEAUTY_2" "$GAL_BEAUTY_3" "$GAL_BEAUTY_4" "$GAL_BEAUTY_5" "$GAL_BEAUTY_6"

# FOOD templates
generate_page "$TEMPLATES_DIR/food-1.html" "food-1" "food" "Restaurant O Belvedere" "Cuisine authentique, saveurs locales" "Papeete" "Restaurant" "#121009" "#E8A838" "#F5F0E8" "Cormorant Garamond" "Inter" "$HERO_FOOD" "$GAL_FOOD_1" "$GAL_FOOD_2" "$GAL_FOOD_3" "$GAL_FOOD_4" "$GAL_FOOD_5" "$GAL_FOOD_6"

generate_page "$TEMPLATES_DIR/food-2.html" "food-2" "food" "Le Coco's" "Le goût de la Polynésie" "Papeete" "Restaurant" "#0A0A0A" "#E8A838" "#E8E0D4" "Playfair Display" "Inter" "$HERO_FOOD" "$GAL_FOOD_1" "$GAL_FOOD_2" "$GAL_FOOD_3" "$GAL_FOOD_4" "$GAL_FOOD_5" "$GAL_FOOD_6"

generate_page "$TEMPLATES_DIR/food-3.html" "food-3" "food" "Roulotte Mama" "Fait maison avec passion" "Papeete" "Roulotte" "#FFFBF5" "#FF6B35" "#2D2D2D" "Poppins" "Inter" "$HERO_FOOD" "$GAL_FOOD_1" "$GAL_FOOD_2" "$GAL_FOOD_3" "$GAL_FOOD_4" "$GAL_FOOD_5" "$GAL_FOOD_6"

# AUTO templates
generate_page "$TEMPLATES_DIR/auto-1.html" "auto-1" "auto" "Garage Automoto" "Votre véhicule entre de bonnes mains" "Papeete" "Garage" "#111111" "#C45D3E" "#E8E0D4" "Oswald" "Inter" "$HERO_AUTO" "$GAL_AUTO_1" "$GAL_AUTO_2" "$GAL_AUTO_3" "$GAL_AUTO_4" "$GAL_AUTO_5" "$GAL_AUTO_6"

generate_page "$TEMPLATES_DIR/auto-2.html" "auto-2" "auto" "Pacific Pneus" "L'expertise automobile à Tahiti" "Papeete" "Pneumatique" "#F5F7FA" "#3B82F6" "#111827" "Montserrat" "Inter" "$HERO_AUTO" "$GAL_AUTO_1" "$GAL_AUTO_2" "$GAL_AUTO_3" "$GAL_AUTO_4" "$GAL_AUTO_5" "$GAL_AUTO_6"

generate_page "$TEMPLATES_DIR/auto-3.html" "auto-3" "auto" "Tahiti Carrosserie" "Mécanique de confiance" "Papeete" "Carrosserie" "#0A0A12" "#00F0FF" "#E8EAF0" "Space Grotesk" "JetBrains Mono" "$HERO_AUTO" "$GAL_AUTO_1" "$GAL_AUTO_2" "$GAL_AUTO_3" "$GAL_AUTO_4" "$GAL_AUTO_5" "$GAL_AUTO_6"

# HEALTH templates
generate_page "$TEMPLATES_DIR/health-1.html" "health-1" "health" "Cabinet Dr. Tama" "Votre santé, notre priorité" "Papeete" "Médecin" "#F8FAFB" "#0D9488" "#1A1A1A" "Plus Jakarta Sans" "Inter" "$HERO_HEALTH" "$GAL_HEALTH_1" "$GAL_HEALTH_2" "$GAL_HEALTH_3" "$GAL_HEALTH_4" "$GAL_HEALTH_5" "$GAL_HEALTH_6"

generate_page "$TEMPLATES_DIR/health-2.html" "health-2" "health" "Zen Wellness" "Au service de votre bien-être" "Punaauia" "Bien-être" "#FDF8F3" "#6B8E5A" "#2D2D2D" "Cormorant Garamond" "DM Sans" "$HERO_HEALTH" "$GAL_HEALTH_1" "$GAL_HEALTH_2" "$GAL_HEALTH_3" "$GAL_HEALTH_4" "$GAL_HEALTH_5" "$GAL_HEALTH_6"

generate_page "$TEMPLATES_DIR/health-3.html" "health-3" "health" "Clinique Paofai" "Soins de qualité à Tahiti" "Papeete" "Clinique" "#F0F4F8" "#1E40AF" "#111827" "Outfit" "Inter" "$HERO_HEALTH" "$GAL_HEALTH_1" "$GAL_HEALTH_2" "$GAL_HEALTH_3" "$GAL_HEALTH_4" "$GAL_HEALTH_5" "$GAL_HEALTH_6"

echo ""
echo "Done! 12 test pages in $DEMO_DIR"
ls -la "$DEMO_DIR"
