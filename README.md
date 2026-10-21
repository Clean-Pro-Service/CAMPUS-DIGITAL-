# CAMPUS DIGITAL

1. **Fichiers** : gardez l'arborescence telle quelle (pages à la racine, `css/`, `js/`).
2. **Firebase** : projet existant `campus-digital-25e40` ; configuration déjà dans `js/firebase.js`. Créez la base Cloud Firestore (mode production) dans la console.
3. **Authentification** : e-mail/mot de passe (déjà activé). Ajoutez votre domaine (localhost, GitHub Pages…) dans Authentication > Paramètres > Domaines autorisés.
4. **Règles (OBLIGATOIRE)** : ouvrez Firebase Console > Firestore Database > Règles, remplacez les règles par le contenu de `firestore.rules`, puis cliquez sur **Publier**. Les règles présentes dans le ZIP ne changent pas toutes seules les règles du site en ligne. Si Firebase CLI est configuré, vous pouvez aussi utiliser `firebase deploy --only firestore:rules`.
5. **Test local** : `python3 -m http.server 8000` puis http://localhost:8000 (pas de `file://`, les modules ES l'interdisent).
6. **Déploiement** : `firebase deploy --only hosting` ou GitHub Pages (racine du dépôt).
7. **Ajouter du contenu** : connectez-vous à `admin.html` avec un e-mail admin, onglet Formations ou Ressources, remplissez le formulaire (URL externe http/https).
8. **Activer un abonnement** : l'étudiant envoie sa demande (`abonnement.html`) ; vérifiez le paiement Mobile Money, puis admin > Demandes > « Activer 30 j ».
9. **Config supplémentaire** : numéro WhatsApp (`WHATSAPP_NUMBER` dans `js/commun.js`) ; Firebase Storage non configuré (pas d'envoi de PDF) ; opérateur du 73 20 70 75 à confirmer.
10. **Tester les permissions** : compte étudiant → `admin.html` refusé, écriture sur `users` d'un champ `subscriptionStatus` refusée ; contenu premium invisible sans abonnement ; compte admin → CRUD complet.

## Sécurité
- Admin = l’e-mail de la session doit être exactement `tameclor@gmail.com` ou `rtameclo@gmail.com`. Les règles Firestore doivent être publiées dans la console du projet pour que le changement soit appliqué au site en ligne.
- L'expiration premium est contrôlée **côté serveur** dans les règles (`subscriptionExpiresAt > request.time`) : pas de tâche planifiée nécessaire.
- Limites : activation manuelle (aucun backend de paiement) ; l'URL d'une ressource premium reste copiable par un abonné ; la lecture des bourses est publique ; pas de limitation de débit anti-spam sur les demandes (Cloud Functions/App Check recommandés).

## Données Firestore
- `users/{uid}` : nom, email, createdAt, telephone (modifiables par l'étudiant : nom, telephone) ; subscriptionStatus, subscriptionExpiresAt, updatedAt (admin seul).
- `formations` : titre, description, niveau, faculte, categorie, url, isPremium, createdAt, updatedAt.
- `ressources` : titre, description, categorie, niveau, url, isPremium, createdAt, updatedAt.
- `bourses` : titre, organisme, pays, niveau, conditions, dateLimite, urlOfficielle, statut (ouverte / clôturée / à vérifier), createdAt.
- `demandes_activation` : ancienne méthode de demande de paiement ; le nouveau parcours Premium se fait directement par WhatsApp et ne crée plus ces documents.
