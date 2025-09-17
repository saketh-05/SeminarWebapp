## 🔑 Steps to Deploy Your Node.js Backend on GKE (using Cloud Shell)
### 1. Open Cloud Shell

- Log in to Google Cloud Console.

- Click Activate Cloud Shell (top-right terminal icon).

- You’ll get a browser terminal with all tools ready.

### 2. Enable Required APIs
```
gcloud services enable container.googleapis.com

gcloud services enable containerregistry.googleapis.com
```

### 3. Clone Your Repo
```
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### 4. Build Docker Image
```
gcloud auth configure-docker
docker build -t gcr.io/$(gcloud config get-value project)/node-backend:v1 .
```

### 5. Push Image to Google Container Registry (GCR)
```
docker push gcr.io/$(gcloud config get-value project)/node-backend:v1
```

### 6. Create a GKE Cluster
```
gcloud container clusters create seminar-cluster \
    --num-nodes=2 \
    --zone=us-central1-a
```

### 7. Get Cluster Credentials
```
gcloud container clusters get-credentials seminar-cluster --zone us-central1-a
```

### 8. Create Kubernetes Deployment & Service

- Make a file deployment.yaml:

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: node-backend
  template:
    metadata:
      labels:
        app: node-backend
    spec:
      containers:
      - name: node-backend
        image: gcr.io/YOUR_PROJECT_ID/node-backend:v1
        ports:
        - containerPort: 3000
```
- service.yml:
```
apiVersion: v1
kind: Service
metadata:
  name: node-backend-service
spec:
  type: LoadBalancer
  selector:
    app: node-backend
  ports:
    - port: 80
      targetPort: 3000
```

**Apply it**:
```
kubectl apply -f deployment.yaml
```

### 9. Get External IP
```
kubectl get svc node-backend-service
```

Look at the **EXTERNAL-IP** column → open it in browser → 🎉 your backend is live.


⚠️ Remember to clean up:
```
gcloud container clusters delete seminar-cluster --zone us-central1-a
```