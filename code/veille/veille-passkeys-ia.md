# Veille informatique — Passkeys & IA

**Période étudiée :** 1er septembre 2025 → 16 octobre 2026  
**Première collecte :** 24 septembre 2026 — **mise à jour :** 16 octobre 2026  
**Objectif :** suivre l’évolution des passkeys, de FIDO2/WebAuthn et de l’authentification des agents IA.

## Synthèse courte

1. **Les passkeys passent du projet pilote au déploiement massif.** FIDO estime à 5 milliards le nombre de passkeys actifs en 2026. Les mesures du Passkey Index montrent une amélioration importante de la réussite et de la vitesse de connexion, mais ces chiffres proviennent surtout de grands fournisseurs et ne constituent pas une mesure universelle.
2. **L’IA augmente la qualité et l’échelle des attaques.** Microsoft a observé des campagnes de phishing assistées par IA avec un taux de clic de 54 %, contre environ 12 % pour des campagnes traditionnelles dans son propre jeu de données. Google documente également des usages de l’IA pour la reconnaissance, les leurres, les logiciels malveillants et l’escroquerie.
3. **Le problème n’est plus seulement le mot de passe.** Les attaques AiTM, le vol de jetons de session, le device-code phishing et l’inscription frauduleuse de nouvelles méthodes MFA peuvent contourner des protections même lorsqu’un utilisateur possède un mot de passe fort.
4. **Un nouveau problème apparaît : authentifier et autoriser un agent.** Un agent ne doit pas recevoir le mot de passe de l’utilisateur. Il lui faut une identité, une délégation limitée, un consentement vérifiable, une traçabilité et une révocation. OAuth sert à l’autorisation ; les passkeys peuvent servir à authentifier l’utilisateur ou le client, mais ne remplacent pas à eux seuls la gestion des droits d’un agent.
5. **Correction importante :** Microsoft ne supprime pas les SMS et la voix en septembre 2026. Les passkeys deviennent l’expérience par défaut le 1er septembre 2026 ; la livraison Microsoft des SMS/voix prend fin le 1er février 2027 pour la majorité des utilisateurs, avec des échéances particulières pour certains administrateurs et utilisateurs externes.
6. **Mise à jour octobre 2026 — le plafond de l’encouragement.** Le rapport Dashlane Passkey Power 20 (13 octobre 2026) montre que les authentifications par passkey ont presque doublé (1,3 M → 2,5 M par mois), mais que **le meilleur service mesuré, Google, n’utilise des passkeys que pour 28 % de ses connexions** : environ 7 connexions sur 10 restent basées sur un mot de passe. Aucun des dix premiers n’impose encore les passkeys.
7. **Mise à jour octobre 2026 — l slippers de l’agent se déplace sur HTTP.** Deux propositions complètent AP2 et Verifiable Intent : **x401** (Proof, Challenge/Réponse d’identité au niveau HTTP avec des identifiants vérifiables et un mandat humain signé) et la **gouvernance MCP**, désormais documentée comme défaillante (15 465 serveurs analysés, 16 % d’hôtes hors UE/États-Unis, permissions « always-allow »).

## 1. Comment fonctionne un passkey

### Les trois composants

- **WebAuthn** : API standard du navigateur et des plateformes qui permet à un site ou une application de créer et utiliser des clés publiques.
- **CTAP** : protocole de communication entre le navigateur/le système et l’authentificateur — téléphone, ordinateur ou clé de sécurité USB/NFC/BLE.
- **FIDO2** : ensemble formé par WebAuthn et CTAP. Un passkey est une clé FIDO2 qui peut être utilisée sans mot de passe.

### Enregistrement

1. Le service (*Relying Party*) génère un défi aléatoire.
2. Le navigateur transmet le défi et l’origine du site via WebAuthn.
3. L’authentificateur crée une paire de clés après vérification utilisateur par code PIN, biométrie ou présence physique.
4. La clé privée est conservée dans l’authentificateur ou dans le gestionnaire de passkeys.
5. Le service reçoit la clé publique et l’identifiant de la clé, jamais la clé privée.

### Connexion

1. Le service renvoie un nouveau défi.
2. L’authentificateur vérifie que la demande correspond bien au site attendu.
3. L’utilisateur desbloque la clé.
4. L’authentificateur signe le défi.
5. Le service vérifie la signature avec la clé publique.

La propriété essentielle est l’**origin binding** : une passkey créée pour `example.com` ne peut pas être utilisée normalement pour `attack.example.net`.

### Nuance importante

- Pour une **passkey liée à un appareil**, la clé privée ne quitte jamais l’appareil.
- Pour une **passkey synchronisée**, la clé peut être chiffrée et synchronisée entre les appareils de l’utilisateur via le Gestionnaire de passkeys du fabricant. Elle n’est toujours pas transmise au service qui l’utilise.
- Les données biométriques restent généralement sur l’appareil ; le service reçoit une preuve de vérification, pas l’empreinte elle-même.

## 2. Pourquoi les mots de passe sont-ils fragiles

Les mots de passe restent un secret partagé entre l’utilisateur et le service. Une fuite de base, une réutilisation, un keylogger ou une page de phishing peut donc compromettre le compte.

Les passkeys changent le modèle : le service ne conserve pas de secret réutilisable et le navigateur vérifie l’origine de la demande. Ils protèrent contre le phishing d’identifiants classique, mais ne protèrent pas automatiquement contre :

- le vol d’un jeton de session déjà obtenu ;
- une attaque AiTM qui relaie une authentification réelle ;
- un appareil compromis ;
- une mauvaise procédure de récupération de compte ;
- une inscription MFA frauduleuse ;
- une attaque par device code.

C’est pourquoi le terme « sans mot de passe » ne doit pas être interprété comme « sans authentification ni risque de compromission ».

## 3. Chiffres et limites à citer avec prudence

| Chiffre | Source | Ce qu’il faut dire |
|---|---|---|
| 22 % des violations de données évaluées ont utilisé des identifiants compromis comme vecteur d’accès initial | Verizon DBIR 2025 | Chiffre Verizon, données 2024 ; ne signifie pas que 22 % de tous les incidents sont du phishing. |
| 31 % des violations de données 2026 commencent par l’exploitation d’une vulnérabilité, devant les identifiants volés | Verizon DBIR 2026 | Les mots de passe ne sont pas le seul problème : les vulnérabilités et la sécurité des applications restent majeures. |
| 28 % des engagements Microsoft ont commencé par phishing ou ingénierie sociale | Microsoft Digital Defense Report 2025 | Périmètre et méthode Microsoft, à ne pas généraliser à tous les secteurs. |
| 54 % de clic contre 12 % pour le phishing impliquant l’IA | Microsoft, avril 2026 | Télémétrie et analyse Microsoft ; utile pour montrer l’effet de l’IA, pas comme taux universel. |
| 5 milliards de passkeys actifs | FIDO Alliance, mai 2026 | Estimation FIDO construite à partir de données publiques et de données de déploiement internes. |
| 93 % des comptes éligibles, 26 % des connexions utilisent une passkey dans le Passkey Index | FIDO Alliance, octobre 2025 | Agrégat de neuf grands services ; ce n’est pas la moyenne de tous les sites web. |
| 28 % des connexions Google utilisent une passkey, contre 72 % encore basées sur un mot de passe | Dashlane Passkey Power 20, octobre 2026 | Mesure de pénétration par domaine sur les authentifications gérées par Dashlane (juillet 2025 – juin 2026), et non une moyenne du web. |
| 57 % d’utilisateurs ayant au moins une passkey | Dashlane, octobre 2026 | Progression de 20 points par an depuis 2024 ; chiffre propre au panel Dashlane. |
| 23 millions d’utilisateurs concernés par le déploiement des passkeys sur GOV.UK One Login, dont ~1 connexion sur 10 déjà en passkey | GOV.UK, septembre 2026 | Déploiement public ; les passkeys restent optionnelles à ce stade. |

## 4. Tableau de veille — septembre 2025 → septembre 2026

| Date | Source | Résumé | Lien | Pertinence |
|---|---|---|---|---|
| 16/09/2025 | Google Cloud — **Agent Payments Protocol (AP2) v0.1** | Premier protocole ouvert pour les paiements pilotés par un agent : mandats Intent/Cart/Payment pour lier les instructions humaines aux achats présents ou délégués. | [Annonce AP2](https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol) | Très élevée — première proposition concrète de délégation et d’intention de paiement. |
| 24/09/2025 | Microsoft Threat Intelligence — **AI vs. AI** | Campagne de phishing utilisant probablement du code généré ou modifié par IA dans un fichier SVG, avec CAPTCHA, browser fingerprinting et suivi de session. | [Source](https://www.microsoft.com/en-us/security/blog/2025/09/24/ai-vs-ai-detecting-an-ai-obfuscated-phishing-campaign/) | Très élevée — exemple concret d’IA utilisée pour contourner des défenses. |
| 07/10/2025 | Microsoft — **Digital Defense Report 2025** | L’IA devient un multiplicateur pour la reconnaissance, le phishing et les intrusions ; Microsoft indique 28 % des engagements initiés par phishing ou ingénierie sociale. | [Source](https://www.microsoft.com/en-us/security/security-insider/threat-landscape/microsoft-digital-defense-report-2025) | Très élevée — état des menaces et statistiques. |
| 14/10/2025 | FIDO Alliance — **Passkey Index** | 93 % des comptes éligibles, 36 % avec au moins une passkey, 26 % des connexions ; 93 % de réussite contre 63 % pour d’autres méthodes et 73 % de gain de temps. | [Source](https://fidoalliance.org/fido-alliance-launches-passkey-index-revealing-significant-passkey-uptake-and-business-benefits) | Élevée — passage à l’échelle et bénéfices mesurés. |
| 16/10/2025 | FIDO Alliance — **Authenticate 2025** | Les panels de l’industrie abordent l’authentification des agents, l’intention vérifiable, le contrôle humain et les identifiants vérifiables. | [Récapitulatif](https://fidoalliance.org/authenticate-2025-day-2-recap) · [Jour 3](https://fidoalliance.org/authenticate-2025-day-3-recap) | Très élevée — transition de la passkey humaine vers l’agent. |
| 05/11/2025 | Google Threat Intelligence Group | Les acteurs étatiques et cybercriminels utilisent l’IA pour la reconnaissance, la création de leurres, les malwares et le contournement de garde-fous. | [Source](https://blog.google/innovation-and-ai/technology/safety-security/google-threat-intelligence-group-report-ai-november-2025/) | Très élevée — menace IA documentée par un fournisseur majeur. |
| 06/11/2025 | Google — **Scams Advisory** | Escroqueries utilisant l’IA, fausses applications, sites de phishing, extensions et recruteurs usurpant des entreprises. | [Source](https://blog.google/innovation-and-ai/technology/safety-security/fraud-and-scams-advisory-november-2025) | Élevée — impact utilisateur concret. |
| 25/11/2025 | Model Context Protocol — **spécification 2025-11-25** | MCP formalise l’autorisation HTTP autour d’un sous-ensemble d’OAuth 2.1 : découverte du serveur, métadonnées de ressource protégée, PKCE, portée incrémentale et liaison du token à l’audience. | [Changelog](https://modelcontextprotocol.io/specification/2025-11-25/changelog) · [Autorisation](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization) | Très élevée — base technique des agents connectés aux outils. |
| 08/12/2025 | Chrome Security — **Agentic Capabilities** | Chrome présente un critique d’alignement isolé, des Agent Origin Sets en lecture/écriture, un journal d’actions et des confirmations avant paiement, message ou connexion sensible. | [Source](https://security.googleblog.com/2025/12/architecting-security-for-agentic.html) | Très élevée — modèle concret de contrôle des agents et de l’injection indirecte. |
| 03/03/2026 | Chrome for Developers — **Device Bound Session Credentials** | DBSC lie les cookies de session à une clé conservée dans le TPM de l’appareil ; un cookie volé devient beaucoup plus difficile à réutiliser ailleurs. | [Source](https://developer.chrome.com/blog/dbsc-windows-announcement) | Très élevée — complément direct des passkeys contre le vol de session. |
| 05/03/2026 | Mastercard — **Verifiable Intent** | Mastercard et Google proposent un enregistrement de l’identité, de l’instruction donnée par l’utilisateur et de l’action de l’agent, afin de rendre l’intention vérifiable. | [Source](https://www.mastercard.com/global/en/news-and-trends/stories/2026/verifiable-intent.html) | Élevée — provenance et auditabilité des transactions agentiques. |
| 14/04/2026 | FIDO Alliance — **OpenAI rejoint l’Alliance** | OpenAI devient membre et participate aux travaux sur l’authentification des agents ; la page membres de la FIDO liste désormais OpenAI. | [Annonce FIDO](https://fidoalliance.org/openai-fido) · [Membres FIDO](https://fidoalliance.org/members/) | Très élevée — adoption institutionnelle, mais pas encore norme déployée. |
| 06/04/2026 | FBI/IC3 — **rapport 2025 sur les escroqueries IA** | Le rapport signale 22 364 plaintes liées à l’IA et 893,35 millions de dollars de pertes ajustées ; l’IA est associée à des profits, recrutements, profils synthétiques et voix clonées. | [Source](https://www.fbi.gov/news/press-releases/cryptocurrency-and-ai-scams-bilk-americans-of-billions) | Élevée — données de plaintes, sous-déclaration et doublons possibles. |
| 28/04/2026 | FIDO Alliance — **Agentic Authentication Working Group** | Création d’un groupe de travail sur l’instruction vérifiable, l’authentification des agents et la délégation bornée ; contributions AP2 et Verifiable Intent. | [Source](https://fidoalliance.org/fido-alliance-to-develop-standards-for-trusted-ai-agent-interactions) | Très élevée — standardisation du nouveau problème. |
| 28/04/2026 | Google — **AP2 donated to FIDO** | Google donne AP2 à la FIDO Alliance et publie AP2 v0.2 avec les paiements « Human Not Present » fondés sur des instructions préautorisées. | [Source](https://blog.google/products-and-platforms/platforms/google-pay/agent-payments-protocol-fido-alliance/) | Très élevée — agent comme acteur économique avec limites. |
| 30/04/2026 | OpenAI — **Advanced Account Security** | Option opt-in pour ChatGPT/Codex : passkeys ou clés FIDO, désactivation de la connexion par mot de passe, récupération par passkeys/backup et sessions raccourcies. | [Source](https://openai.com/index/advanced-account-security/) | Très élevée — déploiement concret de la résistance au phishing chez un fournisseur IA. |
| 01/05/2026 | CISA et partenaires — **Careful Adoption of Agentic AI** | Guide recommandant de commencer par des tâches peu sensibles, de limiter les privilèges, de contrôler les outils et de conserver une supervision humaine. | [Source](https://www.cisa.gov/news-events/news/cisa-us-and-international-partners-release-guide-secure-adoption-agentic-ai) | Très élevée — gouvernance et limites des agents. |
| 07/05/2026 | FIDO Alliance — **State of Passkeys 2026** | 5 milliards de passkeys estimés, 90 % de connaissance, 75 % avec au moins une passkey, 49 % d’usage régulier et 68 % des organisations en déploiement. | [Source](https://fidoalliance.org/fido-alliance-reports-accelerating-global-passkey-adoption-on-world-passkey-day-2026/) | Élevée — état de l’adoption, avec méthodologie à citer. |
| 19/05/2026 | Verizon — **DBIR 2026** | L’exploitation de vulnérabilités devient le premier point d’entrée des violations de données, devant les identifiants volés. | [Source](https://www.verizon.com/about/news/breach-industry-wide-dbir-finds) | Très élevée — empêche de réduire la sécurité à une opposition « mots de passe versus passkeys ». |
| 08/06/2026 | Google — **Scams Advisory** | AITM, quishing, Calendar Phishing, pages invisibles et vol de cookies de session ; Google mentionne les Device Bound Session Credentials. | [Source](https://blog.google/innovation-and-ai/technology/safety-security/fraud-scams-advisory-june-2026) | Très élevée — les passkeys ne neutralisent pas le vol de session. |
| 12/06/2026 | Google/FBI — **Outsider Enterprise** | Réseau de phishing-as-a-service : 9 000 faux sites, plus d’un million d’URL, 2,5 millions de messages et des pertes estimées ; Google décrit l’usage de l’IA pour rendre les escroqueries plus crédibles. | [Source](https://blog.google/innovation-and-ai/technology/safety-security/combatting-ai-scams) | Très élevée — industrialisation de la fraude assistée par IA. |
| 13/07/2026 | Microsoft — **Entra ID** | Passkeys par défaut à partir du 01/09/2026 ; SMS/voice natifs retirés par Microsoft le 01/02/2027 pour la majorité, avec des exceptions. | [Annonce](https://www.microsoft.com/en-us/security/blog/2026/07/13/microsoft-entra-id-security-updates-passkeys-are-the-default-authentication-method-in-entra-id) · [Timeline](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-sms-voice-retirement) | Très élevée — correction de la date et stratégie d’entreprise. |
| 28/07/2026 | Model Context Protocol — **spécification courante** | Nouvelle révision : MCP devient stateless, ajoute `server/discover`, durcit la validation de l’issuer RFC 9207 et déprécie Dynamic Client Registration au profit des Client ID Metadata Documents. | [Changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog) · [Autorisation](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) | Très élevée — la version 2025-11-25 est désormais historique. |
| 25/08/2026 | W3C — **WebAuthn Level 3** | Publication de la Recommandation W3C WebAuthn Level 3, fondement normative du navigateur pour les clés publiques. | [Source](https://www.w3.org/TR/webauthn-3/) | Très élevée — référence technique à présenter. |
| 03/09/2026 | IETF OAuth WG — **OAuth 2.1 draft-16** | La version OAuth 2.1 est toujours un Internet-Draft actif, pas encore un RFC final ; le jalon de soumission à l’IESG est prévu en décembre 2026. | [Source](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/16/) | Élevée — nuance de statut normative. |
| 09/09/2026 | Microsoft Security Research | Le thème « passkey » sert de leurre à des attaques AiTM et device-code ; les tokens et méthodes MFA sont ensuite utilisés pour persistance et accès cloud. | [Source](https://www.microsoft.com/en-us/security/blog/2026/09/09/passkey-themed-social-engineering-leads-identity-cloud-compromise/) | Très élevée — montre que le mot passkey n’est pas une garantie. |
| 22/09/2026 | Microsoft — **EvilTokens** | Plateforme PhaaS émergent en février 2026, avec leurres assistés par IA, device-code phishing et vol de tokens ; plus de 12 000 boîtes aux lettres compromises dans plus de 10 000 organisations. | [Source](https://www.microsoft.com/en-us/security/blog/2026/09/22/unmasking-eviltokens-getting-to-the-root-of-device-code-phishing/) | Très élevée — alerte récente sur les agents et les workflows OAuth. |
| 23/09/2026 | Microsoft Defender — **ISOC** | Microsoft présente un centre opérationnel intégré pour permettre aux humains et aux agents de percevoir, raisonner et agir à la même vitesse. | [Source](https://www.microsoft.com/en-us/security/blog/2026/09/23/reimagining-the-soc-for-the-agentic-era-in-microsoft-defender/) | Élevée — agent comme nouvel acteur opérationnel de sécurité. |

## 4bis — Mise à jour : 24 septembre → 16 octobre 2026

Cette section regroupe ce qui est postérieur à la première collecte. Toutes les entrées ont été vérifiées sur leur source primaire, sauf mention contraire.

| Date | Source | Résumé | Lien | Pertinence |
|---|---|---|---|---|
| 14/09/2026 | GOV.UK / Government Digital Service — **One Login passe aux passkeys** | Déploiement pour **23 millions d’utilisateurs**. 300 000 conversions durant l’essai, environ 1 connexion quotidienne sur 10 en passkey, ~600 £/jour économisés en SMS, connexions jusqu’à 8× plus rapides. Le NCSC recommande officiellement les passkeys. | [Source](https://www.gov.uk/government/news/millions-of-people-to-benefit-from-simpler-more-secure-way-to-sign-in-to-government-services) | Très élevée — premier déploiement de masse gouvernemental, avec chiffres d’usage réels. |
| 10/09/2026 | Google — **Transfert de passkeys entre gestionnaires sur Android** | Android permet le transfert système des mots de passe **et des passkeys** entre gestionnaires via Credential Exchange, sans export CSV. Gestionnaires lancés : Google Password Manager, 1Password, Bitwarden, Dashlane. Android 8+. | [Source](https://blog.google/products-and-platforms/platforms/android/switch-password-managers/) | Très élevée — lève l’objection du verrouillage : la passkey devient un actif portable. |
| 25/06/2026 (spec) puis 15/10/2026 (production) | Proof — **x401** | x401 étend HTTP avec un flux défi/réponse d’identité : le serveur renvoie un `401` décrivant l’identité vérifiable exigée, l’agent présente des **identifiants vérifiables** adossés à un mandat humain signé (actions, budget, services, durée). L’agent n’a pas d’identité propre, il hérite de celle du humain. ESIGN/UETA : x401 fournit le mécanisme d’attribution juridique. Contributeurs : Circle, OpenAI, Okta, MATTR, Lightspark, Commission européenne. | [Annonce](https://www.proof.com/blog/introducing-x401) · [x401.id](https://x401.id/) | Très élevée — troisième protocole d’intention agentique (AP2, Verifiable Intent, x401), et le plus « Web » des trois. |
| 28/09/2026 | Ox Security via Infosecurity Magazine — **« 15 465 MCP Servers, 0 Governance »** | 15 465 serveurs publics analysés, 5 095 hôtes uniques. **16 % résolvent hors des États-Unis** (Russie, Chine) ; MCP n’a pas de concept de région. Plus de 2 % des hôtes ne résolvent plus — donc achetables pour usurper un serveur. Une permission « always-allow » suffit ensuite à lire `.env` sans nouvelle validation. Anthropic : comportement documenté, la détection modèle est heuristique et non une frontière de sécurité. | [Source](https://www.infosecurity-magazine.com/news/mcp-creating-major-governance-gaps/) | Très élevée — le contrepoids nécessaire à la présentation de MCP et AP2. |
| 13/10/2026 | Dashlane — **Passkey Power 20** | Voir section 3. Chiffres clés : Google 28 %, environ 7 connexions sur 10 sans passkey, aucun des dix premiers n’impose, OpenAI #19 (1re plateforme IA), Login.gov #11, Microsoft #16, LINE Yahoo fin du mot de passe seul au printemps 2027. | [Source](https://www.dashlane.com/blog/passkey-report-2026) | Très élevée — la meilleure mesure de l’adoption réelle. |
| 13/10/2026 | HID — **rejoint le conseil FIDO Alliance** | Sean Dyon (VP Authentication) devient délégué principal. Le fabricant de crédentiels physiques d’identité entre au pilotage des standards passkey en entreprise. | [Source](https://securitytoday.com/articles/2026/10/13/hid-joins-fido-alliance-board.aspx) | Élevée — signal de l’industrialisation entreprise du passwordless. |
| 13/10/2026 | Hopae — **rejoint la FIDO Alliance** | Éditeur d’identité numérique (vérification d’identité pour les pays émergents) rejoint l’Alliance. | [FinTech Global](https://fintech.global/2026/10/hopae-joins-fido-alliance-to-advance-digital-identity/) | Moyenne — diversification géographique des membres. |
| 13–14/10/2026 | Intercede — **MyID Authenticate** | Plateforme FIDO/passkeys pour le secteur public et les VPN. | [Coverage](https://www.securityinformed.com/news/intercede-launches-fido-passkey-platform-myid-authenticate-with-european-public-sector-lead-cust-cc-823-ga-co-1612433874-ga.1791889605.html) | Moyenne — déploiement public cohérent avec le mouvement Entra/GOV.UK. |
| 14–15/10/2026 | Microsoft — **démantèlement du réseau Yam Store** | Microsoft, avec la police japonaise, démantèle la marketplace Yam Store (Storm-3119) et les kits Storm-2990 (CoGUI/NX/FA, Haozi/Phoenix, Iron Man System). **Plus d’un milliard** d’e-mails et SMS de phishing vers plus de 75 000 organisations depuis janvier 2026. Domaines expirés hijackés, contenu généré par IA, faux tenants, vol d’identifiants et device-code phishing. 20 000 comptes désactivés, 100 000 domaines bloqués. | [Microsoft Security](https://www.microsoft.com/en-us/security/blog/2026/10/14/the-hidden-network-inside-the-phishing-infrastructure-ecosystem-powering-global-cybercrime/) · [Blog Microsoft](https://blogs.microsoft.com/on-the-issues/2026/10/14/disrupting-the-service-economy-behind-transnational-cybercrime-operations/) | Très élevée — le PhaaS comme service économique, et pas seulement comme campagne. |
| 07/10/2026 | Barracuda — **injections de prompt dans les e-mails de phishing** | Un seul e-mail cible l’humain **et** l’assistant IA qui résume sa boîte : pièce jointe piégée pour l’humain, instruction cachée pour l’agent (commentaires HTML, texte invisible CSS, Base64, caractères de largeur nulle). Exemples réels : un e-mail de facture qui ordonne à l’agent de changer les coordonnées bancaires, un CV qui obtient un « 10/10 », une doc empoisonnée qui insère une ligne d’exfiltration dans du code d’authentification. | [Barracuda](https://blog.barracuda.com/2026/10/07/email-attacks-target-both-humans-ai-assistants) | Très élevée — l’injection indirecte de prompt est devenue une menace d’authentification à part entière. |
| 01/10/2026 | The Register — **espions chinois présumés usurpant un exec Anthropic** | Ciblage d’un dirigeant d’un fournisseur IA et d’un ancien responsable de la Maison-Blanche via phishing IA. | [Source](https://www.theregister.com/2026/10/01/anthropic_exec_ai_phishing/) | Élevée — l’IA comme cible et comme arme dans le même incident. |
| 23/09/2026 (mise à jour) | Microsoft Learn — **détail du retirement SMS/voice** | Précisions : à partir du **30 octobre 2026**, les clients peuvent choisir un fournisseur de téléphonie via Microsoft Security Store (Soprano et Telesign en préversion privée). Après le 1er février 2027, les utilisateurs dont le **seul** MFA est SMS/voice doivent enregistrer une passkey — **bloquant, sans opt-out**. Le paramètre Graph `passkeyDynamicMigration` ne diffère que l’activation automatique, pas l’application. | [Source](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-sms-voice-retirement) | Très élevée — ferme la fenêtre « et si je dois garder les SMS ? ». |
| 07/10/2026 | GOV.UK / NCSC — **appel à l’adoption des passkeys** | Le gouvernement britannique et le NCSC recommandent les passkeys alors que les prises de contrôle de comptes augmentent. | [SC Media](https://www.scworld.co.uk/article/passkeys-are-becoming-more-important-as-account-takeover-attacks-rise) | Élevée — convergence politique et sécurité. |
| 29/09/2026 | OpenAI — **historique de sécurité ChatGPT** | ChatGPT journalise désormais les connexions, les changements MFA et les passkeys dans un historique de sécurité. | [Coverage](https://mixedreality.news/chatgpts-new-security-history-logs-your-sign-ins-mfa-changes-and-passkeys/) | Élevée — la transparence sur l’identité devient une fonctionnalité attendue. |
| 05/10/2026 | Proof / Tavus — **l’IA passe le test vidéo de Turing** | Tavus déclare avoir trompé 48 % des personnes en appel vidéo en direct. | [Proof](https://www.proof.com/blog/ai-video-turing-test) | Élevée — argument fort pour l’authentification cryptographique face à l’imposture vocale et vidéo. |
| 14/10/2026 | Contrepoint — **« les passkeys pourraient restreindre la liberté »** | Des experts alertent sur un possible verrouillage propriétaire à l’ère des passkeys. | [GIGAZINE](https://gigazine.net/gsc_news/en/20261014-passkey-freedom/) | Élevée — argument à traiter en face dans la présentation, surtout avec Credential Exchange. |
| 16/10/2026 | Coalition — **kits de phishing IA et micro-entreprises** | Les kits de phishing IA rendent les micro-entreprises rentables à attaquer. | [Insurance Business](https://www.insurancebusinessmag.com/uk/news/ai-phishing-kits-are-making-micro-businesses-worth-attacking-coalition-warns/) | Moyenne — l’IA descend aussi dans les PME. |
| 19/09 → 12/10/2026 | Déploiements ponctuels | Passkeys ajoutés à l’application Tesla, à Starlink, à OneLogin, à Singpass (Android), à ExpressVPN ExpressKeys, et Visa Payment Passkeys en Inde. | — | Moyenne — utile pour montrer la diffusion hors des géants du web. |

### Ce qui n’a pas bougé

- **MCP** : la révision courante reste **2026-07-28**. Aucune révision postérieure au 16 octobre 2026.
- **OAuth 2.1** : toujours un Internet-Draft (**draft-ietf-oauth-v2-1-16**), pas un RFC. Soumission à l’IESG toujours prévue en décembre 2026.
- **WebAuthn Level 3** : toujours la Recommandation W3C du 25 août 2026, sans révision depuis.

## 5. OAuth, MCP et passkeys : ne pas les confondre

| Problème | Outil/standard adapté |
|---|---|
| Prouver qu’un utilisateur est humain | Passkey / WebAuthn, éventuellement une clé matérielle FIDO2 |
| Prouver l’identité d’un service, d’un client ou d’un agent | OAuth `client_credentials`, mTLS, workload identity, etc. |
| Autoriser un client à agir pour un utilisateur | OAuth, avec scopes, audience, durée et révocation |
| Relier un agent à un outil ou serveur MCP | MCP 2026-07-28 (version courante ; 2025-11-25 historique) + OAuth 2.1 pour les transports HTTP |
| Prouver l’intention et les limites d’un agent | normes émergentes : FIDO Agentic Authentication, AP2, Verifiable Intent, x401 |

OAuth est un protocole d’**autorisation**, pas un protocole d’authentification complet. Une passkey peut être utilisée pendant le flux OAuth pour authentifier l’utilisateur, mais le jeton OAuth obtenu ne remplace pas la passkey.

Dans MCP, le token doit être validable et lié à la ressource visée. Le *token passthrough* — accepter et transmettre un token sans vérifier son audience — est explicitement une mauvaise pratique.

## 6. Alertes recommandées

Je ne peux pas me connecter à ton compte Google Alerts ou Inoreader, ni envoyer une surveillance automatique depuis cette conversation. En revanche, voici des règles directement copiables.

### Alerte 1 — cœur du sujet

```text
("passkey" OR "passkeys" OR WebAuthn OR FIDO2 OR CTAP) (authentication OR security OR phishing OR passwordless)
```

### Alerte 2 — IA et menaces d’identité

```text
("AI phishing" OR "AI-generated phishing" OR deepfake OR "voice cloning" OR "device code phishing") (credential OR authentication OR MFA OR passkey OR token)
```

### Alerte 3 — agents et autorisation

```text
("agentic AI" OR "AI agent" OR "AI agents") (authentication OR authorization OR identity OR OAuth OR MCP OR "verifiable intent" OR AP2)
```

### Alerte 4 — sources primaires

```text
site:fidoalliance.org (passkey OR agentic OR WebAuthn OR CTAP OR authentication)
```

```text
site:modelcontextprotocol.io (authorization OR OAuth OR security OR token)
```

```text
site:microsoft.com/en-us/security/blog (passkey OR "AI phishing" OR "device code" OR agentic)
```

```text
site:blog.google (passkey OR "AI scams" OR "threat intelligence" OR phishing)
```

### Alerte 5 — introduction de prompt et agents (ajoutée le 16/10/2026)

```text
("prompt injection" OR "indirect prompt injection")
(agent OR assistant OR phishing OR authentication OR email)
```

```text
("MCP server" OR "MCP governance") (security OR permission OR "always-allow" OR vulnerability)
```

```text
(x401 OR "verifiable credential" OR "agentic commerce")
(identity OR authorization OR "human authority")
```

### Note pratique sur les alertes

La recherche Google classique renvoie très peu de résultats sur ce sujet. Deux options sont nettement plus efficaces :

**Google News RSS** — à ajouter comme flux brut dans Inoreader, avec `when:25d` pour une fenêtre glissante :

```text
https://news.google.com/rss/search?q=%22passkey%22+OR+%22WebAuthn%22+OR+%22passwordless%22+when:25d&hl=en-US&gl=US&ceid=US:en
```

```text
https://news.google.com/rss/search?q=%22agentic%22+%22authentication%22+OR+%22AI+agent%22+identity+when:25d&hl=en-US&gl=US&ceid=US:en
```

**Requêtes avec date de début**, pour ne remonter que ce qui est postérieur à votre dernier point :

```text
after:2026-10-16 ("passkey" OR WebAuthn OR FIDO2) (authentication OR adoption OR security)
```

```text
after:2026-10-16 site:fidoalliance.org (agentic OR passkey OR "Agentic Authentication")
```

```text
after:2026-10-16 site:modelcontextprotocol.io/specification (authorization OR security OR changelog)
```

```text
after:2026-10-16 ("AI phishing" OR "phishing-as-a-service" OR "device code") (token OR credential OR agent)
```

### Réduire le bruit

Ajouter si nécessaire :

```text
-course -training -job -discount -deal -connexion -téléchargement
```

Google Alerts est peu rentable seul sur ce sujet : les publications sont peu nombreuses et les termes officiels varient. Les flux RSS et Inoreader sont plus adaptés.

### Règles Inoreader recommandées

**Conserver si le titre contient :**

```regex
passkey|passkeys|webauthn|fido2|ctap|passwordless|phishing-resistant|agentic|agent authentication|verifiable intent|AP2|x401|OAuth 2.1|MCP|device code|AiTM|prompt injection|credential exchange
```

**Domaines prioritaires :**

- `fidoalliance.org`
- `w3.org`
- `modelcontextprotocol.io`
- `datatracker.ietf.org`
- `microsoft.com/security`
- `security.googleblog.com`
- `blog.google`
- `verizon.com/business/resources/reports`
- `krebsonsecurity.com`

**Classement :**

1. `Norme ou spécification`
2. `Menace / campagne`
3. `Déploiement`
4. `Étude / chiffres`
5. `Presse ou communauté — à recouper`

Reddit peut servir de radar, mais une discussion Reddit ne doit pas être présentée comme une preuve sans source primaire.

## 7. Plan de présentation en 6 parties

1. **Le problème** — mots de passe, phishing, AiTM, device code et jetons de session.
2. **La réponse** — WebAuthn + CTAP2, clé privée, origin binding, passkeys synchronisées ou liées à l’appareil.
3. **Le double rôle de l’IA** — l’IA augmente la menace et devient un acteur qui doit être autorisé.
4. **Les nouvelles normes** — MCP 2026-07-28 (la révision 2025-11-25 étant historique), OAuth 2.1 encore en draft, FIDO Agentic Authentication, AP2, Verifiable Intent et x401.
5. **La conclusion** — les passkeys sont une barrière anti-phishing très forte, mais la sécurité complète repose aussi sur la gestion des sessions, la récupération, les appareils, les consentements et la révocation.
6. **Le contrepoint à ne pas cacher** — Credential Exchange (Apple puis Google) rend les passkeys portables et répond à la peur du verrouillage ; en revanche aucun grand service n’impose encore la passkey, et le mot de passe reste majoritaire.

## 8. Limites de cette veille

- Les chiffres FIDO, Microsoft, Google, Verizon, Mastercard et Dashlane sont des données issues de leurs propres panels ou jeux de données. Dashlane ne mesure que les authentifications gérées par son propre produit : son « 28 % chez Google » n’est pas représentatif de tous les utilisateurs Google.
- Les taux comme 54 % contre 12 % ne doivent pas être comparés directement avec les chiffres d’une autre organisation.
- Les classements 2025 et 2026 du Passkey Power 20 de Dashlane ne sont pas comparables entre eux : 2025 mesurait un volume, 2026 une pénétration.
- Les documents OAuth 2.1 et plusieurs projets agentiques sont encore en évolution ; vérifier la version exacte avant une présentation.
- x401, AP2 et Verifiable Intent sont des propositions émergentes, pas encore des normes FIDO finalisées.
- Une actualité de presse doit être reliée à la spécification ou au communiqué primaire avant d’être présentée comme une norme adoptée.
