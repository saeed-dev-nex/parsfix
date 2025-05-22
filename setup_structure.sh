#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e
# Print each command to stdout before executing it.
set -x

echo "Creating Parsflix client (Next.js/TS) and server (Express/JS) project structure..."
echo "Target Root Directory: $(pwd)" # Show current directory where script is run

# === Root Directories ===
mkdir -p client server
echo "Created root 'client' and 'server' directories."

# === Client Structure (Next.js - inside client/) ===
# --- Client section remains unchanged (using TypeScript) ---
echo "Setting up client/ structure (Next.js/TS)..."
mkdir -p client/src/app \
         client/src/components \
         client/src/contexts \
         client/src/hooks \
         client/src/lib \
         client/src/theme \
         client/public
mkdir -p "client/src/app/(public)/movies" \
         "client/src/app/(public)/series" \
         "client/src/app/(public)/categories/[slug]" \
         "client/src/app/(public)/auth/login" \
         "client/src/app/(public)/auth/signup" \
         "client/src/app/(public)/profile" \
         client/src/app/admin/movies \
         client/src/app/admin/series \
         client/src/app/admin/actors \
         client/src/app/admin/directors \
         client/src/app/admin/genres \
         client/src/app/admin/users \
         client/src/app/admin/comments \
         client/src/app/admin/suggestions \
         client/src/app/admin/settings \
         client/src/app/admin/chat \
         client/src/app/api
echo "Client directory structure created."
echo "Touching client .tsx, .css, .ts files..."
touch client/src/app/layout.tsx
touch client/src/app/page.tsx
touch client/src/app/globals.css
# ... (rest of client touch commands remain the same as before) ...
touch "client/src/app/(public)/layout.tsx"
touch "client/src/app/(public)/page.tsx"
touch "client/src/app/(public)/movies/page.tsx"
touch "client/src/app/(public)/series/page.tsx"
touch "client/src/app/(public)/categories/[slug]/page.tsx"
touch "client/src/app/(public)/auth/login/page.tsx"
touch "client/src/app/(public)/auth/signup/page.tsx"
touch "client/src/app/(public)/profile/page.tsx"
touch "client/src/app/(public)/profile/layout.tsx"
touch client/src/app/admin/layout.tsx
touch client/src/app/admin/page.tsx
touch client/src/app/admin/movies/page.tsx
touch client/src/app/admin/series/page.tsx
touch client/src/app/admin/actors/page.tsx
touch client/src/app/admin/directors/page.tsx
touch client/src/app/admin/genres/page.tsx
touch client/src/app/admin/users/page.tsx
touch client/src/app/admin/comments/page.tsx
touch client/src/app/admin/suggestions/page.tsx
touch client/src/app/admin/settings/page.tsx
touch client/src/app/admin/chat/page.tsx
touch client/src/app/api/.gitkeep
mkdir -p client/src/components/ui \
         client/src/components/layout \
         client/src/components/auth \
         client/src/components/movies \
         client/src/components/series \
         client/src/components/admin
touch client/src/components/ui/.gitkeep \
      client/src/components/layout/.gitkeep \
      client/src/components/auth/.gitkeep \
      client/src/components/movies/.gitkeep \
      client/src/components/series/.gitkeep \
      client/src/components/admin/.gitkeep
mkdir -p client/src/contexts client/src/hooks client/src/lib client/src/theme
touch client/src/contexts/.gitkeep
touch client/src/hooks/.gitkeep
touch client/src/lib/api.ts \
      client/src/lib/utils.ts \
      client/src/lib/validators.ts
touch client/src/theme/theme.ts
touch client/public/.gitkeep
echo "Client structure setup complete."
# --- End of Client Section ---

# === Server Structure (Express + Prisma + MVC - inside server/ using JavaScript) ===
echo "Setting up server/ structure (Express/JS)..."
mkdir -p server/src/config \
         server/src/controllers \
         server/src/services \
         server/src/routes \
         server/src/middlewares \
         server/src/utils \
         server/src/validations \
         server/prisma
echo "Server directory structure created."

# Server Placeholder Files (.js, .prisma)
echo "Touching server .js and .prisma files..."
# Changed all .ts extensions to .js
touch server/src/config/db.js \
      server/src/config/env.js \
      server/src/config/cloudinary.js
touch server/src/controllers/authController.js \
      server/src/controllers/movieController.js \
      server/src/controllers/seriesController.js \
      server/src/controllers/personController.js \
      server/src/controllers/genreController.js \
      server/src/controllers/userController.js \
      server/src/controllers/commentController.js \
      server/src/controllers/suggestionController.js \
      server/src/controllers/chatController.js \
      server/src/controllers/adminController.js
touch server/src/services/authService.js \
      server/src/services/movieService.js \
      server/src/services/seriesService.js \
      server/src/services/personService.js \
      server/src/services/genreService.js \
      server/src/services/userService.js \
      server/src/services/commentService.js \
      server/src/services/suggestionService.js \
      server/src/services/chatService.js \
      server/src/services/tmdbService.js
touch server/src/routes/index.js \
      server/src/routes/authRoutes.js \
      server/src/routes/movieRoutes.js \
      server/src/routes/seriesRoutes.js \
      server/src/routes/personRoutes.js \
      server/src/routes/genreRoutes.js \
      server/src/routes/userRoutes.js \
      server/src/routes/commentRoutes.js \
      server/src/routes/suggestionRoutes.js \
      server/src/routes/chatRoutes.js \
      server/src/routes/adminRoutes.js
touch server/src/middlewares/authMiddleware.js \
      server/src/middlewares/roleMiddleware.js \
      server/src/middlewares/errorMiddleware.js \
      server/src/middlewares/validationMiddleware.js
touch server/src/utils/helpers.js \
      server/src/utils/jwtHelper.js \
      server/src/utils/passwordHelper.js \
      server/src/utils/apiResponse.js
touch server/src/validations/authValidation.js \
      server/src/validations/movieValidation.js \
      server/src/validations/userValidation.js
touch server/src/server.js             # Changed to .js
touch server/prisma/schema.prisma      # Stays .prisma
touch server/.env
echo "Server files touched."
echo "Server structure setup complete."

# === Root Files ===
echo "Creating/Updating root files (README.md, .gitignore)..."
touch README.md

# Create or append to root .gitignore (content remains the same)
echo "# Adding entries to root .gitignore" >> .gitignore
GITIGNORE_TMP=$(mktemp)
cat << EOF > "$GITIGNORE_TMP"
# Dependency directories
node_modules/
*/node_modules/

# Build output
dist/
build/
*/dist/
*/build/

# Next.js build output
client/.next/
client/out/

# Environment variables
.env*
!.env.example
client/.env.local
client/.env.development.local
client/.env.production.local
server/.env

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# OS generated files
.DS_Store
Thumbs.db

# IDE / Editor directories
.idea/
.vscode/
*.sublime-project
*.sublime-workspace

# Optional Prisma generated client
# node_modules/.prisma/client

# Lock files
# package-lock.json
# yarn.lock
# pnpm-lock.yaml
EOF
sort "$GITIGNORE_TMP" | uniq >> .gitignore
sort .gitignore | uniq > "$GITIGNORE_TMP" && mv "$GITIGNORE_TMP" .gitignore
rm -f "$GITIGNORE_TMP"

echo "Root files setup complete."

# Disable echoing of commands before final messages
set +x

echo "------------------------------------------------------------------"
echo " Client (TS) and Server (JS) project structure setup attempt complete."
echo "------------------------------------------------------------------"
echo " Please check the output above for any errors."
echo " Verify that '.js' files now exist in the 'server/src' subdirectories."
echo ""
echo " IMPORTANT NEXT STEPS (if structure is correct):"
echo "   1. Navigate into the 'client' directory: cd client"
echo "   2. Initialize Next.js (TS): yarn create next-app . --typescript --eslint --tailwind --src-dir --app --import-alias \"@/*\""
echo "      (Confirm overwrite for existing files if prompted)"
echo "   3. Navigate into the 'server' directory: cd ../server"
echo "   4. Initialize Node.js project: yarn init -y"
echo "   5. Install server dependencies (Express, Prisma, etc. for JS):"
echo "      yarn add express dotenv @prisma/client cloudinary bcrypt jsonwebtoken cors zod" # Add core dependencies
echo "      yarn add -D nodemon prisma"  # Add dev dependencies (nodemon for restart, prisma for CLI)
echo "      (Adjust dependencies like zod, cors, bcrypt, jsonwebtoken as needed)"
echo "   6. Configure 'server/prisma/schema.prisma' with your database models (MySQL)."
echo "   7. Review and update the root '.gitignore' file if needed."
echo "   8. Start developing! Add code to your .js files in the server and .tsx/.ts files in the client."
echo "------------------------------------------------------------------"