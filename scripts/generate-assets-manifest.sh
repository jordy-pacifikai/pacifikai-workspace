#!/bin/bash
# =============================================================================
# PACIFIK'AI - Générateur de Manifest Assets
# Scanne les dossiers prospects et génère assets-manifest.json
# =============================================================================

PACIFIKAI_DIR="/Users/jordybanks/Documents/PACIFIKAI/Argentic Workflows/PACIFIK'AI"
OUTPUT_FILE="$PACIFIKAI_DIR/dashboard/assets-manifest.json"

# Dossiers à ignorer (pas des prospects)
IGNORE_DIRS="_templates _archive scripts dashboard clients solutions marketing n8n-builder n8n-framework landing-page business"

echo "Scanning PACIFIK'AI directory for prospect assets..."

# Start JSON
echo "{" > "$OUTPUT_FILE"
echo '  "generated": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",' >> "$OUTPUT_FILE"
echo '  "prospects": {' >> "$OUTPUT_FILE"

first_prospect=true

# Loop through directories
for dir in "$PACIFIKAI_DIR"/*/; do
    dirname=$(basename "$dir")

    # Skip hidden and ignored directories
    if [[ "$dirname" == .* ]]; then
        continue
    fi

    skip=false
    for ignore in $IGNORE_DIRS; do
        if [[ "$dirname" == "$ignore" ]]; then
            skip=true
            break
        fi
    done

    if $skip; then
        continue
    fi

    # Check if directory has files (not just subdirs)
    file_count=$(find "$dir" -maxdepth 3 -type f \( -name "*.html" -o -name "*.md" -o -name "*.pdf" \) 2>/dev/null | wc -l)

    if [ "$file_count" -gt 0 ]; then
        if ! $first_prospect; then
            echo "," >> "$OUTPUT_FILE"
        fi
        first_prospect=false

        echo -n "    \"$dirname\": {" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        echo "      \"folder\": \"$dirname\"," >> "$OUTPUT_FILE"
        echo '      "files": [' >> "$OUTPUT_FILE"

        first_file=true

        # Find all relevant files
        while IFS= read -r -d '' file; do
            filename=$(basename "$file")
            relpath="${file#$dir}"

            # Determine file type based on filename and path
            filetype="doc"

            if [[ "$relpath" == "demo/index.html" ]] || [[ "$filename" == *landing* ]]; then
                filetype="site"
            elif [[ "$filename" == *dashboard* ]] || [[ "$relpath" == demo/dashboard* ]]; then
                filetype="dash"
            elif [[ "$filename" == *n8n* ]] || [[ "$relpath" == workflows/* ]] || [[ "$filename" == *.json ]]; then
                filetype="wf"
            elif [[ "$filename" == *FICHE_RECHERCHE* ]]; then
                filetype="fiche"
            fi

            # Generate description based on filename (remove extension and replace - _ with spaces)
            desc=$(echo "$filename" | sed 's/[-_]/ /g' | sed 's/\.[^.]*$//')

            if ! $first_file; then
                echo "," >> "$OUTPUT_FILE"
            fi
            first_file=false

            # Escape special chars in filename for JSON
            escaped_file=$(echo "$relpath" | sed 's/"/\\"/g')
            escaped_desc=$(echo "$desc" | sed 's/"/\\"/g')

            echo -n "        {\"name\": \"$filename\", \"file\": \"$escaped_file\", \"type\": \"$filetype\", \"desc\": \"$escaped_desc\"}" >> "$OUTPUT_FILE"

        done < <(find "$dir" -maxdepth 3 -type f \( -name "*.html" -o -name "*.md" -o -name "*.pdf" \) -print0 2>/dev/null | sort -z)

        echo "" >> "$OUTPUT_FILE"
        echo "      ]" >> "$OUTPUT_FILE"
        echo -n "    }" >> "$OUTPUT_FILE"
    fi
done

echo "" >> "$OUTPUT_FILE"
echo "  }" >> "$OUTPUT_FILE"
echo "}" >> "$OUTPUT_FILE"

echo "Manifest generated: $OUTPUT_FILE"
echo "Found $(grep -c '"name":' "$OUTPUT_FILE") files across prospects"
