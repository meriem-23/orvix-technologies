# Orvix Technologies — site, espace client et administration

Next.js 15 (App Router) + Supabase (Auth, Postgres, Storage). Thème sombre par défaut avec bouton clair/sombre, pensé mobile d'abord.

## Ce que contient le site

| Partie | Pages |
|---|---|
| **Vitrine** | Accueil (console interactive des logiciels), `/logiciels` (filtre par secteur), `/logiciels/[slug]`, `/sur-mesure`, `/contact` (démo / achat / sur mesure, pré-rempli depuis chaque logiciel) |
| **Compte** | `/inscription`, `/connexion`, `/mot-de-passe-oublie`, `/nouveau-mot-de-passe` |
| **Espace client** `/espace` | Vue d'ensemble, Mes licences (clé masquée + copier), Téléchargements (liens signés 60 s), Demandes et devis, Support (tickets + fil de discussion), Profil |
| **Admin** `/admin` | Tableau de bord, Demandes (statut + réponse au client + WhatsApp direct), Support, Licences (génération de clés `ORVX-XXXX-XXXX-XXXX-XXXX`), Logiciels (catalogue + envoi des installateurs), Clients (bloquer/débloquer), Paramètres du site (téléphone, WhatsApp, e-mail, bandeau d'annonce), Journal d'activité, Sécurité (2FA) |

## Installation (15 minutes)

1. **Créer un projet Supabase** sur supabase.com.
2. **SQL Editor** → coller et exécuter `supabase/schema.sql`, puis `supabase/seed.sql` (les 11 logiciels + coordonnées).
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

**Déploiement Vercel** : importer le dossier, ajouter les 4 variables d'environnement, déployer.

## Sécurité

- **Row Level Security sur toutes les tables** : un client ne voit que ses licences, tickets et demandes ; il ne peut ni changer son rôle, ni créer une licence, ni écrire `is_staff` ou une réponse admin (testé sur Postgres : 24 scénarios).
- **2FA obligatoire pour l'admin, vérifiée par la base** : `is_admin()` exige une session `aal2`. Un mot de passe admin volé ne donne aucun droit, même via l'API directe.
- Rôle admin attribuable uniquement en SQL (un trigger bloque toute modification depuis le site).
- Installateurs dans un **bucket privé** : téléchargement uniquement avec licence active, via lien signé de 60 secondes.
- **Limitation de débit** en base (connexion, inscription, formulaire, tickets, téléchargements) + champ piège anti-robots.
- Validation de toutes les entrées avec Zod côté serveur ; messages d'erreur sans fuite d'information (pas d'énumération de comptes).
- En-têtes : CSP avec nonce par requête, HSTS, `X-Frame-Options: DENY`, `nosniff`, Referrer/Permissions-Policy ; espaces privés en `no-store` + `noindex`.
- Clés de licence générées avec le générateur cryptographique du système (80 bits).
- Journal de toutes les actions admin.

## Changer le nom ou le logo

- Nom, téléphone par défaut, préfixe des clés : `src/lib/site.ts`.
- Noms des logiciels (« Orvix Pharma »…) : Admin → Logiciels.
- Logo : remplacer le composant `Mark` dans `src/components/logo.tsx` et `src/app/icon.svg`.
- Couleurs : variables en haut de `src/app/globals.css` (thème clair et sombre).
