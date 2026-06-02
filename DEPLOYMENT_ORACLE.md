# Déploiement Backend sur Oracle Cloud (OCI)

## Méthodes recommandées

### Option 1 : Oracle Cloud Container Instances (La plus simple)

#### 1. Créer un compte Oracle Cloud
- Allez sur https://cloud.oracle.com
- Créez un compte (toujours gratuit pour beaucoup de services)

#### 2. Créer un Container Registry (OCIR)
1. Dans la console OCI, allez à **Developer Services > Container Registry**
2. Créez un dépôt (ex: `artconnect-backend`)

#### 3. Pousser votre image Docker sur OCIR
```bash
# Se connecter à OCIR
docker login -u 'ocid1.user.oc1..xxxxxxxxxx' -i <region-key>.ocir.io

# Taguer votre image
docker tag artconnect-backend:latest <region-key>.ocir.io/<namespace>/artconnect-backend:latest

# Pousser l'image
docker push <region-key>.ocir.io/<namespace>/artconnect-backend:latest
```

#### 4. Créer une Container Instance
1. Allez à **Compute > Container Instances**
2. Cliquez sur **Create container instance**
3. Sélectionnez votre image OCIR
4. Configurez :
   - Shape: **Ampere A1.Flex** (toujours gratuit)
   - Ports: Exposer le port 8000
5. Ajoutez vos variables d'environnement (.env)
6. Créez l'instance

---

### Option 2 : Oracle Cloud Compute (VM)

#### 1. Créer une VM
1. Allez à **Compute > Instances**
2. Cliquez sur **Create instance**
3. Choisissez:
   - Image: **Ubuntu 22.04**
   - Shape: **Ampere A1.Flex** (toujours gratuit)
4. Téléchargez votre clé SSH

#### 2. Se connecter à la VM
```bash
ssh ubuntu@<votre-ip-publique>
```

#### 3. Installer Docker
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
```

#### 4. Transférer et lancer votre backend
```bash
# Sur votre machine locale
scp -r backend/ ubuntu@<votre-ip>:/home/ubuntu/

# Sur la VM
cd /home/ubuntu/backend
docker build -t artconnect-backend .
docker run -d -p 8000:8000 --name artconnect-backend artconnect-backend
```

#### 5. Configurer un reverse proxy (Nginx)
```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/artconnect
```

Ajoutez ceci :
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activez le site :
```bash
sudo ln -s /etc/nginx/sites-available/artconnect /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### Option 3 : Oracle Cloud Functions (Serverless)

Pour un déploiement serverless, utilisez **Oracle Functions** avec un runtime Python.

---

## Variables d'environnement obligatoires

Créez un fichier `.env` dans le dossier `backend/` :

```env
SECRET_KEY=votre_cle_secrete_32_caracteres_minimum
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxx
DATABASE_URL=sqlite:///./artconnect.db
CORS_ORIGINS=["https://votre-frontend.com"]
```

---

## Base de données sur OCI

Pour remplacer SQLite par une base de données cloud :

### Oracle Autonomous Database (Gratuit)
1. Créez une **Autonomous Database** (Always Free)
2. Mettez à jour votre `DATABASE_URL`
3. Installez le pilote Oracle : `pip install oracledb`

### MySQL Database Service
Alternativement, utilisez MySQL sur OCI.

---

## Stockage des fichiers sur OCI Object Storage

Remplacez le stockage local par **OCI Object Storage** :

1. Créez un bucket dans **Storage > Object Storage**
2. Générez des clés d'accès
3. Mettez à jour vos variables d'environnement

---

## SSL/TLS avec Let's Encrypt

Pour HTTPS :
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d votre-domaine.com
```

---

## Vérification

Vérifiez que votre backend fonctionne :
```bash
curl https://votre-domaine.com/api/health
```

---

## Bonnes pratiques

- Utilisez **Always Free Tier** d'Oracle pour tester
- Sauvegardez régulièrement votre base de données
- Mettez en place des logs et monitoring (OCI Monitoring)
- Utilisez un VCN et Security Lists sécurisés
