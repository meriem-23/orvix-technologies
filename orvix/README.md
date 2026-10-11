# Orvix Technologies — site, espace client et administration

Next.js 15 (App Router) + Supabase (Auth, Postgres, Storage). Couleurs du logo (magenta → violet → bleu sur bleu nuit), vagues animées inspirées du logo, thème sombre par défaut avec bouton clair/sombre, pensé mobile d'abord.

## Ce que contient le site

| Partie | Pages |
|---|---|
| **Vitrine** | Accueil (vagues animées + console interactive des logiciels), `/logiciels`, `/logiciels/[slug]`, `/materiel` (solutions publicitaires, informatique et PC), `/materiel/[slug]`, `/sur-mesure`, `/contact` (pré-rempli depuis chaque produit) |
| **Compte** | `/inscription`, `/connexion`, `/mot-de-passe-oublie`, `/nouveau-mot-de-passe` |
| **Espace client** `/espace` | Vue d'ensemble, Mes licences (clé masquée + copier), Téléchargements (liens signés 60 s), Demandes et devis, Support (tickets + fil de discussion), Profil |
| **Admin** `/admin` | Tableau de bord, Demandes (statut + réponse au client + WhatsApp direct), Support, Licences (génération de clés `ORVX-XXXX-XXXX-XXXX-XXXX`), Catalogue (logiciels avec envoi des installateurs, matériel et publicité avec photos et stock), Clients (bloquer/débloquer), Paramètres du site (téléphone, WhatsApp, e-mail, bandeau d'annonce), Journal d'activité, Sécurité (2FA) |

## Installation (15 minutes)

1. **Créer un projet Supabase** sur supabase.com.
2. **SQL Editor** → coller et exécuter `supabase/schema.sql`, puis `supabase/seed.sql` (11 logiciels, 4 articles de matériel, coordonnées). Si vous aviez déjà installé la première version, ré-exécutez simplement les deux fichiers : la base est mise à jour sans perte.
3. **Authentication → Sign In / Providers → Multi-Factor** : activer **TOTP** (obligatoire pour l'admin).
4. **Authentication → URL Configuration** : *Site URL* = votre domaine, ajouter `https://votre-domaine/auth/callback` dans *Redirect URLs*.
5. **Storage → releases** : régler la taille max des fichiers (ex. 500 Mo) selon vos installateurs.
6. Copier `.env.example` en `.env.local` et remplir les clés (Project Settings → API).
7. `npm install` puis `npm run dev` → http://localhost:3000
8. **Créer votre compte admin** : inscrivez-vous sur le site, confirmez l'e-mail, puis dans le SQL Editor :
   ```sql
   update public.profiles set role = 'admin' where email = 'votre@email.com';
   ```
   À la connexion suivante, `/admin` vous demande de scanner un QR code avec Google Authenticator.

**Déploiement Vercel** : importer le dossier, ajouter les 5 variables d'environnement (dont `LICENSE_SIGNING_PRIVATE_KEY`, voir plus bas), déployer.

## Sécurité

- **Row Level Security sur toutes les tables** : un client ne voit que ses licences, tickets et demandes ; il ne peut ni changer son rôle, ni créer une licence, ni écrire `is_staff` ou une réponse admin (testé sur Postgres : 29 scénarios, dont la mise à jour depuis la première version).
- **2FA obligatoire pour l'admin, vérifiée par la base** : `is_admin()` exige une session `aal2`. Un mot de passe admin volé ne donne aucun droit, même via l'API directe.
- Rôle admin attribuable uniquement en SQL (un trigger bloque toute modification depuis le site).
- Installateurs dans un **bucket privé** : téléchargement uniquement avec licence active, via lien signé de 60 secondes.
- **Limitation de débit** en base (connexion, inscription, formulaire, tickets, téléchargements) + champ piège anti-robots.
- Validation de toutes les entrées avec Zod côté serveur ; messages d'erreur sans fuite d'information (pas d'énumération de comptes).
- En-têtes : CSP avec nonce par requête, HSTS, `X-Frame-Options: DENY`, `nosniff`, Referrer/Permissions-Policy ; espaces privés en `no-store` + `noindex`.
- Clés de licence générées avec le générateur cryptographique du système (80 bits).
- Journal de toutes les actions admin.

## Activation des logiciels (Orvix Resto et les suivants)

Les logiciels Windows s'activent avec une clé `ORVX-…` créée dans **Admin → Licences**. Ils contactent le site une seule fois (`/api/licences/activate`), puis fonctionnent hors ligne ; ils revérifient la licence tous les 7 jours quand internet est là (45 jours maximum sans internet).

- Le site signe une « preuve d'activation » avec une **clé privée** (variable Vercel `LICENSE_SIGNING_PRIVATE_KEY`). Les logiciels contiennent seulement la **clé publique** : ils peuvent vérifier, jamais fabriquer une activation.
- Nouvelle paire de clés : `node scripts/generate-license-keys.mjs` (la clé publique va dans `electron/config.ts` de chaque logiciel, qu'il faut alors recompiler).
- Le champ « Postes » d'une licence limite le nombre de PC. **Admin → Licences → Libérer les postes** remet le compteur à zéro (changement de PC).
- Suspendre ou faire expirer une licence bloque le logiciel à sa prochaine vérification.

## Installateurs lourds (plus de 50 Mo)

L'offre gratuite de Supabase limite chaque fichier à 50 Mo. Les installateurs Orvix font environ 100 Mo : dans **Admin → Logiciels → (logiciel) → Versions**, choisissez **Lien externe** et collez un lien GitHub Releases ou Google Drive (« Tous les utilisateurs disposant du lien »). Le site ne donne ce lien qu'aux clients qui ont une licence active ; et sans clé, le logiciel ne démarre pas.

## Photos des produits

Admin → Catalogue → (produit) → **Ajouter une photo** (JPG, PNG ou WebP, 5 Mo max), puis Enregistrer. Tant qu'il n'y a pas de photo, une vignette aux couleurs du logo s'affiche.

## Changer le nom ou le logo

- Nom, téléphone par défaut, préfixe des clés : `src/lib/site.ts`.
- Noms des logiciels (« Orvix Pharma »…) : Admin → Logiciels.
- Logo : fichiers dans `public/brand/` (symbole détouré pour fond clair et fond sombre, logos complets), favicon `src/app/icon.png`.
- Vagues animées : `src/components/waves.tsx` (nombre de traînées, taille des gouttes).
- Couleurs : variables en haut de `src/app/globals.css` (thème clair et sombre).
